import axios from 'axios'
import { stringify } from 'qs'
import { Authenticated, BodyParams, Controller, HeaderParams, Post, Request, Required } from 'ts-express-decorators'
import { users } from '../db/postgres'

@Controller('/user')
export class UserController {

  @Post('/update')
  @Authenticated()
  public async update(
    @Request() request: Express.Request,
    @BodyParams('ethAddress') ethAddress?: string,
    @BodyParams('streamlabsToken') streamlabsToken?: string,
  ) {
    return await users.updateUser(request.decoded.id, ethAddress, streamlabsToken)
  }

  @Post('/delete')
  @Authenticated()
  public async delete(
    @Request() request: Express.Request,
  ) {
    return await users.deleteUser(request.decoded.id)
  }

  @Post('/sendNotification')
  public async sendNotification(
    @Required @HeaderParams('Authorization') token: string,
  ) {
    const data = stringify({
      access_token: token,
      type: 'donation',
      image_href: 'https://www.randomwebsite.com/monkey.gif',
      sound_href: 'https://www.randomwebsite.com/honksound.wav',
      message: 'Your streams are the best!',
      duration: '3000',
      special_text_color: 'Orange',
    })

    return axios.post('https://streamlabs.com/api/v1.0/alerts', data).then((res) => {
      return res.data
    }).catch((err) => {
      return err.response.data
    })
  }
}
