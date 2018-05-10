export const ENV = process.env.NODE_ENV
export const INFURA_ACCESS_TOKEN = process.env.INFURA_ACCESS_TOKEN
export const WEB3_PROVIDER_URI = INFURA_ACCESS_TOKEN ?
`${process.env.WEB3_PROVIDER_URI}/${INFURA_ACCESS_TOKEN}` : process.env.WEB3_PROVIDER_URI
export const PORT = 8000

export const PG_DB = 'ethstream'
export const PG_HOST = 'localhost'
export const PG_USER = 'postgres'
export const PG_PORT = 5432
export const PG_PASS = 'pukapuka'
export const TWITCH_CLIENT_ID = 'y8n21fwws8pnf1jhlhdv6hplclr7sl'
export const TWITCH_CLIENT_SECRET = '8c8hboyt932rweuiswvulfkfq98psz'

export const STREAMLABS_CLIENT_ID = 'PTyYxpMn1xoqMwcKRYDbMFvGoOMTbpHewqE4LzRZ'
export const STREAMLABS_CLIENT_SECRET = 'Xw405d8tHH8EiWxs0dqaQj1Qf2XRwm8DtBnsYNCD'

export const cryptoPass = 'EwnaBmd80iNwwdSbWNjQn6xuKnRBCMFB'

export const baseUrl = ENV === 'production' ? 'https://cryptopotam.us' : 'http://localhost:3000'
