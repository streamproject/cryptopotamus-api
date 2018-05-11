import axios from 'axios'
import { stringify } from 'qs'
import { Authenticated, BodyParams, Controller, Post, Request } from 'ts-express-decorators'
import { users } from '../db/postgres'
import { EthService } from '../services/EthService'
import { decrypt, encrypt } from '../utils/crypto'
import { BadRequest, NotFound } from 'ts-httpexceptions';

@Controller('/user')
export class UserController {

  constructor(
    private ethService: EthService,
  ) { }

  @Post('/update')
  @Authenticated()
  public async update(
    @Request() request: Express.Request,
    @BodyParams('ethAddress') ethAddress?: string,
    @BodyParams('streamlabsToken') streamlabsToken?: string,
  ) {
    return await users.updateUser(request.decoded.id, ethAddress, encrypt(streamlabsToken))
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
    const data = stringify({
      access_token: decrypt(user.streamlabs_token),
      type: 'donation',
      message: `${name} donated ${value} eth`,
      user_message: message,
      duration: '1000',
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
    @Request() request: Express.Request,
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
        duration: '1000',
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
