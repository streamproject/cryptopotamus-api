import * as crypto from 'crypto'
import { cryptoPass, iv } from '../config'

const algorithm = 'aes-256-cbc'

export function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, cryptoPass, iv)
  let crypted = cipher.update(text, 'utf8', 'hex')
  crypted += cipher.final('hex')
  return crypted
}

export function decrypt(text) {
  const decipher = crypto.createDecipheriv(algorithm, cryptoPass, iv)
  let dec = decipher.update(text, 'hex', 'utf8')
  dec += decipher.final('utf8')
  return dec
}
