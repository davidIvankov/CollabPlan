import {
  CamelCasePlugin,
  Kysely,
  ParseJSONResultsPlugin,
  PostgresDialect,
} from 'kysely'
import pg from 'pg'
import logger from '@server/logger'
import type { DB } from './types'

export function createDatabase(options: pg.PoolConfig): Kysely<DB> {
  try {
    const pool = new pg.Pool(options)

    const db = new Kysely<DB>({
      dialect: new PostgresDialect({ pool }),
      plugins: [new CamelCasePlugin(), new ParseJSONResultsPlugin()],
    })

    logger.info('Database connection pool created successfully')

    return db
  } catch (error) {
    if (error instanceof Error)
      logger.error(`Failed to create database: ${error.message}`, { error })
    throw error // Re-throw to handle it higher up in your app
  }
}

export type Database = Kysely<DB>
export type DatabasePartial<T> = Kysely<T>
export * from './types'
