import * as passport from 'passport'
import * as passportStreamlabs from 'passport-streamlabs'
import * as passportTwitch from 'passport-twitch'
import { BeforeRoutesInit, ExpressApplication, Inject, ServerSettingsService, Service } from 'ts-express-decorators'
import { streamlabsStrategyOptions, twitchStrategyOptions } from '../apiOptionsConfig'
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
      ...twitchStrategyOptions,
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
      ...streamlabsStrategyOptions,
    },
      async (accessToken, refreshToken, profile, done) => {
        const user = await users.findUser(profile.id)

        done(null, { user, refreshToken, accessToken })
      }),
    )
  }

}

export const passportInstance = passport
