export const ENV = process.env.NODE_ENV
export const INFURA_ACCESS_TOKEN = process.env.INFURA_ACCESS_TOKEN
export const WEB3_PROVIDER_URI = INFURA_ACCESS_TOKEN ?
`${process.env.WEB3_PROVIDER_URI}/${INFURA_ACCESS_TOKEN}` : process.env.WEB3_PROVIDER_URI
