import axios from 'axios'
import { stringify } from 'qs'
import { Authenticated, BodyParams, Controller, Post, Request } from 'ts-express-decorators'
import { TWITCH_CLIENT_ID } from '../config'
import { users } from '../db/postgres'

@Controller('/user')
export class UserController {

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
      access_token: user.streamlabs_token,
      type: 'donation',
      message: name + ' donated ' + value + ' eth ',
      user_message: message,
      duration: '5000',
    })

    console.log(data)
    return axios.post('https://streamlabs.com/api/v1.0/alerts', data).then((res) => {
      console.log('DATA SUCCESS' + res.data)
      return res.data
    }).catch((err) => {
      return err.response.data
    })
  }
}
