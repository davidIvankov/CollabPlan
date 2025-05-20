import { Kysely } from 'kysely'
import { TABLES } from '../dbConstants'

export async function up(db: Kysely<any>) {
  await db.schema
    .alterTable(TABLES.NOTIFICATION)
    .addColumn('emailed', 'boolean', (col) => col.notNull().defaultTo(false))
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema
    .alterTable(TABLES.NOTIFICATION)
    .dropColumn('emailed')
    .execute()
}
