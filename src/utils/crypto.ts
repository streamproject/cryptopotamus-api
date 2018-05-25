import * as crypto from 'crypto'
import { CRYPTO_PASS } from '../config'

const algorithm = 'aes-256-ctr'
const iv = crypto.randomBytes(16)

export function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, CRYPTO_PASS, iv)
  let crypted = cipher.update(text, 'utf8', 'hex')
  crypted += cipher.final('hex')
  return crypted
}

export function decrypt(text) {
  const decipher = crypto.createDecipheriv(algorithm, CRYPTO_PASS, iv)
  let dec = decipher.update(text, 'hex', 'utf8')
  dec += decipher.final('utf8')
  return dec
}
