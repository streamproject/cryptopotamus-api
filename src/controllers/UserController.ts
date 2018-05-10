import axios from 'axios'
import { stringify } from 'qs'
import { Authenticated, BodyParams, Controller, Post, Request } from 'ts-express-decorators'
import { users } from '../db/postgres'
import { decrypt, encrypt } from '../utils/crypto'

@Controller('/user')
export class UserController {

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
      message: name + 'donated' + value + 'eth',
      user_message: message,
      duration: '1000',
    })

    return axios.post('https://streamlabs.com/api/v1.0/alerts', data).then((res) => {
      return res.data
    }).catch((err) => {
      return err.response.data
    })
  }
}
