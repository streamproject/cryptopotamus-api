import axios from 'axios'
import { stringify } from 'qs'
import { Authenticated, BodyParams, Controller, Post, Request } from 'ts-express-decorators'
import { BadRequest, NotFound } from 'ts-httpexceptions'
import { TWITCH_CLIENT_ID } from '../config'
import { users } from '../db/postgres'
import { EthService } from '../services/EthService'
import { decrypt } from '../utils/crypto'

@Controller('/user')
export class UserController {

  constructor(
    private ethService: EthService,
  ) { }

  @Post('/me')
  @Authenticated()
  public async me(
    @Request() request: Express.Request,
  ) {
    return axios.get(`https://api.twitch.tv/kraken/users/${request.decoded.id}?client_id=${TWITCH_CLIENT_ID}`,
      { headers: { Accept: 'application/vnd.twitchtv.v5+json' } },
    ).then((res) => {
      return res.data
    })
  }

  @Post('/meById')
  public async meById(
    @BodyParams('channelId') id: string,
  ) {
    return axios.get(`https://api.twitch.tv/kraken/users/${id}?client_id=${TWITCH_CLIENT_ID}`,
      { headers: { Accept: 'application/vnd.twitchtv.v5+json' } },
    ).then((res) => {
      return res.data
    })
  }

  @Post('/findUser')
  @Authenticated()
  public async findUser(
    @Request() request: Express.Request,
  ) {
    return users.findUser(request.decoded.id)
  }

  @Post('/findUserById')
  public async findUserById(
    @BodyParams('channelId') id: string,
  ) {
    return users.findUser(id)
  }

  @Post('/update')
  @Authenticated()
  public async update(
    @Request() request: Express.Request,
    @BodyParams('ethAddress') ethAddress: string,
  ) {
    return await users.updateUser(request.decoded.id, ethAddress)
  }

  @Post('/delete')
  @Authenticated()
  public async delete(
    @Request() request: Express.Request,
  ) {
    return await users.deleteUser(request.decoded.id)
  }

  @Post('/sendTestNotification')
  @Authenticated()
  public async sendNotification(
    @Request() request: Express.Request,
    @BodyParams('message') message: string,
    @BodyParams('name') name: string,
    @BodyParams('value') value: string,
  ) {
    const user = await users.findUser(request.decoded.id)

    const dataAlert = stringify({
      access_token: decrypt(user.streamlabs_token),
      type: 'donation',
      message: `${name} donated ${value} eth`,
      user_message: message,
      duration: '3000',
    })

    const dataDonation = {
      access_token: decrypt(user.streamlabs_token),
      name,
      message,
      identifier: '123',
      amount: value,
      currency: 'USD',
      skip_alert: 'yes',
    }

    try {
      await axios.post('https://streamlabs.com/api/v1.0/alerts', dataAlert)
      try {
        const donation = await axios.post('https://streamlabs.com/api/v1.0/donations', dataDonation)
        return donation.data
      } catch (err) {
        throw new BadRequest(err.response.data)
      }
    } catch (err) {
      throw new BadRequest(err.response.data)
    }
  }

  @Post('/sendTx')
  public async sendTx(
    @BodyParams('txHash') txHash: string,
    @BodyParams('message') message: string,
    @BodyParams('name') name: string,
    @BodyParams('value') value: string,
    @BodyParams('valueUSD') valueUSD: string,
   ) {
    try {
      const tx = await this.ethService.web3.eth.getTransaction(txHash)
      const recipient = await users.findUserByAddress(tx.to)

      if (!recipient) {
        throw new NotFound(txHash)
      } else if (tx.value !== value) {
        throw new BadRequest(value)
      }

      // TODO validate that user agrees with name

      const dataAlert = stringify({
        access_token: decrypt(recipient.streamlabs_token),
        type: 'donation',
        message: `${name} donated $${valueUSD}`,
        user_message: message,
        duration: '3000',
      })
      const dataDonation = {
        access_token: decrypt(recipient.streamlabs_token),
        name,
        message,
        identifier: '123',
        amount: valueUSD,
        currency: 'USD',
        skip_alert: 'yes',
      }

      try {
        await axios.post('https://streamlabs.com/api/v1.0/alerts', dataAlert)
        try {
          const donation = await axios.post('https://streamlabs.com/api/v1.0/donations', dataDonation)
          return donation.data
        } catch (err) {
          throw new BadRequest(err.response)
        }
      } catch (err) {
        throw new BadRequest(err.response)
      }

    } catch (err) {
      throw err
    }
  }
}
