import axios from 'axios'
import { stringify } from 'qs'
import { Authenticated, BodyParams, Controller, Post, Request } from 'ts-express-decorators'
import { BadRequest, NotFound } from 'ts-httpexceptions'
import * as uuid from 'uuid'
import { TWITCH_CLIENT_ID } from '../config'
import { transactions, users } from '../db/postgres'
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
    try {
      const twitchResponse = await axios.get(
        `https://api.twitch.tv/kraken/users/${request.decoded.id}?client_id=${TWITCH_CLIENT_ID}`,
        { headers: { Accept: 'application/vnd.twitchtv.v5+json' } },
      )

      return twitchResponse.data
    } catch (err) {
      throw new BadRequest(err)
    }
  }

  @Post('/meById')
  public async meById(
    @BodyParams('channelId') id: string,
  ) {
    try {
      const twitchResponse = await axios.get(`https://api.twitch.tv/kraken/users/${id}?client_id=${TWITCH_CLIENT_ID}`,
        { headers: { Accept: 'application/vnd.twitchtv.v5+json' } },
      )
      return twitchResponse.data
    } catch (err) {
      throw new BadRequest(err)
    }
  }

  @Post('/findUser')
  @Authenticated()
  public async findUser(
    @Request() request: Express.Request,
  ) {
    try {
      return await users.findUser(request.decoded.id)
    } catch (err) {
      throw new BadRequest(err)
    }
  }

  @Post('/findUserById')
  public async findUserById(
    @BodyParams('channelId') id: string,
  ) {
    try {
      return await users.findUser(id)
    } catch (err) {
      throw new BadRequest(err)
    }
  }

  @Post('/update')
  @Authenticated()
  public async update(
    @Request() request: Express.Request,
    @BodyParams('ethAddress') ethAddress: string,
  ) {
    try {
      return await users.updateUser(request.decoded.id, ethAddress)
    } catch (err) {
      throw new BadRequest(err)
    }
  }

  @Post('/delete')
  @Authenticated()
  public async delete(
    @Request() request: Express.Request,
  ) {
    try {
      return await users.deleteUser(request.decoded.id)
    } catch (err) {
      throw new BadRequest(err)
    }
  }

  @Post('/sendTestNotification')
  @Authenticated()
  public async sendNotification(
    @Request() request: Express.Request,
  ) {
    const user = await users.findUser(request.decoded.id)

    const dataAlert = stringify({
      image_href: 'https://image.ibb.co/cSmao8/logo.png',
      access_token: decrypt(user.streamlabs_token),
      type: 'donation',
      message: `* nickname * donated * 0.002 ETH ~( $1.00) *`,
      user_message: 'This is where the message goes',
      duration: '3000',
      special_text_color: '#6572fd',
    })
    const dataDonation = {
      access_token: decrypt(user.streamlabs_token),
      name: 'nickname',
      message: 'This is where the message goes',
      identifier: uuid.v4().replace(/-/g, ''),
      amount: '1',
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
  // TO DO FIX SPAM TXHASH ENDPOINT
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
      let dbTx

      try {
        dbTx = await transactions.findTrasaction(txHash)
      } catch (err) {
        throw new BadRequest(err)
      }

      if (dbTx) {
        throw new BadRequest('TxHash has already been used')
      }

      if (!recipient) {
        throw new NotFound(txHash)
      } else if (tx.value !== value) {
        throw new BadRequest(value)
      }

      if (!message) {
        message = ' '
      }

      const dataAlert = stringify({
        image_href: 'https://image.ibb.co/cSmao8/logo.png',
        access_token: decrypt(recipient.streamlabs_token),
        type: 'donation',
        message: `* ${name} * donated * ${(Number(value) / 1000000000000000000).toFixed(3)} ETH ~($ ${valueUSD}) *`,
        user_message: message,
        duration: '3000',
        special_text_color: '#6572fd',
      })

      const dataDonation = {
        access_token: decrypt(recipient.streamlabs_token),
        name,
        message,
        identifier: uuid.v4().replace(/-/g, ''),
        amount: valueUSD,
        currency: 'USD',
        skip_alert: 'yes',
      }

      try {
        await axios.post('https://streamlabs.com/api/v1.0/alerts', dataAlert)
        try {
          const donation = await axios.post('https://streamlabs.com/api/v1.0/donations', dataDonation)
          try {
            await transactions.addTransaction(txHash)
            return donation.data
          } catch (err) {
            throw new BadRequest(err.response.data)
          }
        } catch (err) {
          throw new BadRequest(err.response.data)
        }
      } catch (err) {
        throw new BadRequest(err.response)
      }
    } catch (err) {
      throw err
    }
  }
}
