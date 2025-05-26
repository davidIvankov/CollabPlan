import type { Kysely } from 'kysely'
import { TABLES } from '../dbConstants'

export async function up(db: Kysely<any>) {
  await db.schema
    .createIndex('user_name_unique')
    .on(TABLES.USER)
    .column('name')
    .unique()
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema
    .dropIndex('user_name_unique')
    .ifExists() // optional: avoids error if index was already dropped
    .execute()
}
