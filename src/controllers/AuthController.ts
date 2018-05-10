import { Controller, Get, Request, Res, Response } from 'ts-express-decorators'
import { ENV } from '../config'
import { users } from '../db/postgres'
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
    @Request() request: Express.Request,
    @Response() response: any,
  ) {
    return new Promise((resolve, reject) => {
      passportInstance.authenticate('twitch', (err, data) => {
        if (err) {
          reject(err)
        }

        const baseUrl = ENV === 'production' ? 'https://cryptopotam.us' : 'http://localhost:3000'

        resolve(response.redirect(`${baseUrl}/setup?access_token=${data.accessToken}`))
      })(request, response, () => {
      })
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
    @Request() request: Express.Request,
    @Response() response: any,
  ) {
    return new Promise((resolve, reject) => {
      passportInstance.authenticate('streamlabs', (err, data) => {
        if (err) {
          reject(err)
        }
        const baseUrl = ENV === 'production' ? 'https://cryptopotam.us' : 'http://localhost:3000'

        users.updateUser(data.user.twitch_id, null, data.accessToken)
        resolve(response.redirect(`${baseUrl}/donate/${data.user.twitch_id}`))
      })(request, response, () => {
      })
    })
  }
}
