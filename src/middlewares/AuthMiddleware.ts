import axios from 'axios'
import { NextFunction } from 'express-serve-static-core'
import {
  AuthenticatedMiddleware,
  HeaderParams, IMiddleware, Next, OverrideMiddleware, Request,
} from 'ts-express-decorators'
import { Unauthorized } from 'ts-httpexceptions'

@OverrideMiddleware(AuthenticatedMiddleware)
export default class AuthorizeMiddleware implements IMiddleware {
  public async use(
    @HeaderParams('Authorization') accessToken: string,
    @Request() request: Express.Request,
    @Next() next: NextFunction,
  ) {
    if (!accessToken) {
      next(new Unauthorized('no acccess token bitch'))
    }

    axios.get(`https://id.twitch.tv/oauth2/validate`, { headers: { Authorization: 'OAuth ' + accessToken } })
      .then((res) => {
        request.decoded = { id: res.data.user_id }
        next()
      }).catch((err) => {
        next(new Unauthorized(err.response.statusText))
      })
  }
}
