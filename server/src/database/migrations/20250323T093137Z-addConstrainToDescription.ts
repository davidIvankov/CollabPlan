import type { Kysely } from 'kysely'
import { TABLES } from '../dbConstants'

export async function up(db: Kysely<any>) {
  return db.schema
    .alterTable(TABLES.PROJECT)
    .alterColumn('description', (col) => col.setNotNull())
    .execute()
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
export async function down(db: Kysely<any>) {}
