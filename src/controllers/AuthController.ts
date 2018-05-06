import axios from 'axios'
import { stringify } from 'qs'
import { Controller, Get, QueryParams, Request, Res } from 'ts-express-decorators'
import { STREAMLABS_CLIENT_ID, STREAMLABS_CLIENT_SECRET, TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET } from '../config'
import { passportInstance } from '../services/PassportService'

@Controller('/auth')
export class AuthController {

  @Get('/twitch')
  public loginTwitch(
    @Request() request: Express.Request,
    @Res() response: Express.Response,
  ) {
    passportInstance.authenticate('twitch', () => {
    })(request, response, () => {
    })
  }

  @Get('/twitch/callback')
  public callbackTwitch(
    @QueryParams('code') code: string,
  ) {
    const data = stringify({client_id: TWITCH_CLIENT_ID,
      client_secret: TWITCH_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: 'http://localhost:8000/api/v1/auth/twitch/callback',
    })

    return axios.post(`https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}`, data).then((res) => {
      return res.data
    }).catch((err) => {
      return err.response.data
    })
  }

@Get('/streamlabs')
  public loginStreamlabs(
    @Request() request: Express.Request,
    @Res() response: Express.Response,
  ) {
    passportInstance.authenticate('streamlabs', () => {
    })(request, response, () => {
    })
  }

@Get('/streamlabs/callback')
  public callbackStreamlabs(
@QueryParams('code') code: string,
  ) {
    return axios.post(`https://streamlabs.com/api/v1.0/token`, {
      grant_type: 'authorization_code',
      client_id: STREAMLABS_CLIENT_ID,
      client_secret: STREAMLABS_CLIENT_SECRET,
      redirect_uri: 'http://localhost:8000/api/v1/auth/streamlabs/callback',
      code,
    })
      .then((res) => {
        return res.data
      }).catch((err) => {
        return err.response.data
      })
  }
}
