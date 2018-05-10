import * as pgPromise from 'pg-promise'
// import { POSTGRES_DB, POSTGRES_HOST, POSTGRES_PASS, POSTGRES_USER } from '../config'
import * as genUuid from 'uuid/v4'
import { PG_DB, PG_HOST, PG_PASS, PG_USER, PORT } from '../config'
import * as tables from '../models/tables'

const cn = {
  database: PG_DB,
  host: PG_HOST,
  password: PG_PASS,
  port: PORT,
  user: PG_USER,
}

const postgresdb = pgPromise()(cn)

// wrapper around postgresdb.one to enforce stronger types
const addOrUpdateRow = async <T>(query: pgPromise.TQuery, newRow: T): Promise<T> => {
  return await postgresdb.one<T>(query, newRow)
}

export async function postgresdbExists() {
  try {
    const obj = await postgresdb.connect()
    obj.done()
    return true
  } catch (err) {
    return false
  }
}

export const users = {
  async addNewUser(twitchId: string) {

    const newUser = {
      id: genUuid(),
      twitch_id: twitchId,
    }

    return await postgresdb.one<tables.users>(`INSERT INTO users VALUES(
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

  deleteUser(twitchId: string) {
    return postgresdb.none(`DELETE FROM users WHERE twitch_id=$(twitchId)`, { twitchId })
  },

}
