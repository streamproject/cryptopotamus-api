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
    @BodyParams('message') message: string,
    @BodyParams('name') name: string,
    @BodyParams('value') value: string,
  ) {
    const user = await users.findUser(request.decoded.id)
    const data = stringify({
      access_token: decrypt(user.streamlabs_token),
      type: 'donation',
      message: `${name} donated ${value} eth`,
      user_message: message,
      duration: '3000',
    })

    try {
      const notification = await axios.post('https://streamlabs.com/api/v1.0/alerts', data)
      return notification.data
    } catch (err) {
      throw new BadRequest(err.response.data)
    }
  }

  @Post('/sendTx')
  @Authenticated()
  public async sendTx(
    @BodyParams('txHash') txHash: string,
    @BodyParams('message') message: string,
    @BodyParams('name') name: string,
    @BodyParams('value') value: string,
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

      const data = stringify({
        access_token: decrypt(recipient.streamlabs_token),
        type: 'donation',
        message: `${name} donated ${value} eth`,
        user_message: message,
        duration: '3000',
      })

      try {
        const notification = await axios.post('https://streamlabs.com/api/v1.0/alerts', data)
        return notification.data
      } catch (err) {
        throw new BadRequest(err.response.data)
      }

    } catch (err) {
      throw err
    }
  }
}
