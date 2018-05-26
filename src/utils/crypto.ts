import * as crypto from 'crypto'
import { CRYPTO_PASS, IV } from '../config'

const algorithm = 'aes-256-ctr'

export function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, CRYPTO_PASS, IV)
  let crypted = cipher.update(text, 'utf8', 'hex')
  crypted += cipher.final('hex')
  return crypted
}

export function decrypt(text) {
  const decipher = crypto.createDecipheriv(algorithm, CRYPTO_PASS, IV)
  let dec = decipher.update(text, 'hex', 'utf8')
  dec += decipher.final('utf8')
  return dec
}
