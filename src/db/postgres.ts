import * as pgPromise from 'pg-promise'
import * as genUuid from 'uuid/v4'
import { PG_DB, PG_HOST, PG_PASS, PG_PORT, PG_USER } from '../config'
import * as tables from '../models/tables'

const cn = {
  database: PG_DB,
  host: PG_HOST,
  password: PG_PASS,
  port: PG_PORT,
  user: PG_USER,
}

const postgresdb = pgPromise()(cn)

// wrapper around postgresdb.one to enforce stronger types
const addOrUpdateRow = async <T>(query: pgPromise.TQuery, newRow: T): Promise<T> => {
  return await postgresdb.one<T>(query, newRow)
}

export const users = {
  createTable() {
    return postgresdb.none(`CREATE TABLE users (
id text PRIMARY KEY NOT NULL,
twitch_id INTEGER NOT NULL UNIQUE,
streamlabs_token text,
eth_address text)`)
  },

  async addNewUser(twitchId: string) {
    const newUser = {
      id: genUuid(),
      twitch_id: twitchId,
    }

    return await postgresdb.oneOrNone<tables.users>(`INSERT INTO users VALUES(
      $(id),
      $(twitch_id)
    ) RETURNING *`, newUser)
  },

  updateUser(twitchId, ethAddress?: string, streamlabsToken?: string) {
    const updatedUser = {
      twitchId,
      ethAddress,
      streamlabsToken,
    }

    return addOrUpdateRow(`UPDATE users
      SET (eth_address, streamlabs_token) = (
        COALESCE($(ethAddress), eth_address),
        COALESCE($(streamlabsToken), streamlabs_token)
      )
      WHERE twitch_id = $(twitchId)
      RETURNING *
    `, updatedUser)
  },

  findUser(twitchId: string) {
    return postgresdb.oneOrNone<tables.users>(`SELECT * FROM users WHERE twitch_id=$(twitchId)`, { twitchId })
  },

  findUserByAddress(address: string) {
    return postgresdb.oneOrNone<tables.users>(`SELECT * FROM users WHERE eth_address=$(address)`, { address })
  },

  deleteUser(twitchId: string) {
    return postgresdb.none(`DELETE FROM users WHERE twitch_id=$(twitchId)`, { twitchId })
  },

}

export const transactions = {
  createTable() {
    return postgresdb.none(`CREATE TABLE transactions (tx_hash text PRIMARY KEY NOT NULL)`)
  },

  async addTransaction(txHash: string) {
    return await postgresdb.oneOrNone<tables.transactions>(`INSERT INTO transactions VALUES(
      $(tx_hash)
    ) RETURNING *`, { tx_hash: txHash })
  },

  async findTrasaction(txHash: string) {
    return await postgresdb.oneOrNone<tables.transactions>(`SELECT * FROM transactions WHERE tx_hash=$(txHash)`,
      { txHash })
  },
}
