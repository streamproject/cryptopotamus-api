import * as crypto from 'crypto'
import { ENCRYPTION_KEY } from '../config'

// http://vancelucas.com/blog/stronger-encryption-and-decryption-in-node-js/
const algorithm = 'aes-256-cbc'
const IV_LENGTH = 16

export function encrypt(text) {
 const iv = crypto.randomBytes(IV_LENGTH)
 const cipher = crypto.createCipheriv(algorithm, new Buffer(ENCRYPTION_KEY), iv)
 let encrypted = cipher.update(text)

 encrypted = Buffer.concat([encrypted, cipher.final()])

 return iv.toString('hex') + ':' + encrypted.toString('hex')

}

export function decrypt(text) {
 const textParts = text.split(':')
 const iv = new Buffer(textParts.shift(), 'hex')
 const encryptedText = new Buffer(textParts.join(':'), 'hex')
 const decipher = crypto.createDecipheriv(algorithm, new Buffer(ENCRYPTION_KEY), iv)
 let decrypted = decipher.update(encryptedText)

 decrypted = Buffer.concat([decrypted, decipher.final()])

 return decrypted.toString()
}
