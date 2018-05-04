import * as bodyParser from 'body-parser'
import * as path from 'path'
import { GlobalAcceptMimesMiddleware, GlobalErrorHandlerMiddleware,
  ServerLoader, ServerSettings } from '@tsed/common'
import { ENV, PORT } from './config'

const rootDir = path.resolve(__dirname)

@ServerSettings({
  rootDir,
  port: PORT,
  httpsPort: false,
  mount: {
    '/api/v1/': `${rootDir}/controllers/**/*.js`,
  },
  acceptMimes: ['application/json'],
  debug: ENV === 'development',
  componentsScan: [
    `${rootDir}/services/**/**.js`,
    `${rootDir}/middlewares/**/**.js`,
  ],
  logger: {
    debug: false,
    logRequest: true,
    requestFields: ['reqId', 'method', 'url', 'headers', 'query', 'params', 'duration'],
  },
})

export default class Server extends ServerLoader {

  public $onMountingMiddlewares() {
    this
      .use(GlobalAcceptMimesMiddleware)
      .use(bodyParser.json())
      .use(bodyParser.urlencoded({ extended: true }))

    if (!this.getSettingsService().debug) {
      this.set('trust proxy', 1)
    }
  }

  public $afterRoutesInit() {
    this.use(GlobalErrorHandlerMiddleware)
  }
}
