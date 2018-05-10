import axios from 'axios'
import { stringify } from 'qs'
import { Controller, Get, QueryParams, Request, Res, Response } from 'ts-express-decorators'
import { streamlabsToken, twitchToken } from '../apiOptionsConfig'
import { ENV } from '../config'
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
    @Response() response: any,
  ) {
    const data = stringify({
      ...twitchToken,
      code,
    })

    const baseUrl = ENV === 'production' ? 'https://cryptopotam.us' : 'http://localhost:3000'

    return axios.post(`https://id.twitch.tv/oauth2/token`, data).then((res) => {
      response.redirect(`${baseUrl}/setup?access_token=${res.data.access_token}`)
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
      ...streamlabsToken,
      code,
    })
      .then((res) => {
        return res.data
      }).catch((err) => {
        return err.response.data
      })
  }
}
