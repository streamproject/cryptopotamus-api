import * as passport from 'passport'
import * as passportStreamlabs from 'passport-streamlabs'
import * as passportTwitch from 'passport-twitch'
import { BeforeRoutesInit, ExpressApplication, Inject, ServerSettingsService, Service } from 'ts-express-decorators'
import { users } from '../db/postgres'

const twitchStrategy = passportTwitch.Strategy
const streamlabsStrategy = passportStreamlabs.Strategy

@Service()
export class PassportService implements BeforeRoutesInit {

  constructor(private serverSettings: ServerSettingsService,
              @Inject(ExpressApplication) private expressApplication: ExpressApplication) {

  }

  public $beforeRoutesInit() {
    const options: any = this.serverSettings.get('passport') || {} as any
    const { userProperty, pauseStream } = options // options stored with ServerSettings
    this.expressApplication.use(passport.initialize({ userProperty }))
    this.expressApplication.use(passport.session({ pauseStream }))

    passport.use(new twitchStrategy({
      clientID: 'y8n21fwws8pnf1jhlhdv6hplclr7sl',
      clientSecret: '8c8hboyt932rweuiswvulfkfq98psz',
      callbackURL: 'http://localhost:8000/api/v1/auth/twitch/callback',
      scope: 'user_read',
    },
      async (accessToken, refreshToken, profile, done) => {
        let user = await users.findUser(profile.id)
        if (!user) {
          user = await users.addNewUser(profile.id)
        }
        done(null, { user, refreshToken, accessToken })
      }),
    )

    passport.use(new streamlabsStrategy({
      clientID: 'HTrqkAZwXpxznv86eikbIQWXVzgkJNVvwRGOS9K1',
      clientSecret: '9cPMMMbEJPLBsHjmJNN85qKjlnvE3AMEXe9RqySZ',
      callbackURL: 'http://localhost:8000/api/v1/auth/streamlabs/callback',
      scope: 'alerts.create',
    },
      async (accessToken, refreshToken, profile, done) => {
        const user = await users.findUser(profile.id)

        done(null, { user, refreshToken, accessToken })
      }),
    )
  }

}

export const passportInstance = passport
