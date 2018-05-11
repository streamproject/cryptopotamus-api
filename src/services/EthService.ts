import { Service } from 'ts-express-decorators'
import * as Web3 from 'web3'
import { WEB3_PROVIDER_URI } from '../config'

@Service()
export class EthService {
  // Because web3 typings are broken.
  public web3 = (new (Web3 as any)(WEB3_PROVIDER_URI) as Web3.default)

  // public async setupSubscriptions() {
  //   this.web3.eth.subscribe('pendingTransactions', async (err, tx) => {
  //     if (err) {
  //       throw err
  //     }

  //     console.log(await this.web3.eth.getTransaction(`${tx}`))
  //   })
  // }
}
