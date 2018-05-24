import * as dotenv from 'dotenv'
dotenv.config()

export const ENV = process.env.NODE_ENV

export const INFURA_ACCESS_TOKEN = process.env.INFURA_ACCESS_TOKEN
export const WEB3_PROVIDER_URI = ENV === 'production' ?
  'wss://mainnet.infura.io/_ws' : `https://ropsten.infura.io/${INFURA_ACCESS_TOKEN}`

export const PORT = parseInt(process.env.PORT, 10)

export const PG_DB = process.env.PG_DB
export const PG_HOST = process.env.PG_HOST
export const PG_USER = process.env.PG_USER
export const PG_PORT = parseInt(process.env.PG_PORT, 10)
export const PG_PASS = process.env.PG_PASS
export const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID
export const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET

export const STREAMLABS_CLIENT_ID = process.env.STREAMLABS_CLIENT_ID
export const STREAMLABS_CLIENT_SECRET = process.env.STREAMLABS_CLIENT_SECRET

export const CRYPTO_PASS = process.env.CRYPTO_PASS

export const BASE_URL = process.env.BASE_URL
