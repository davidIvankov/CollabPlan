import type { Kysely } from 'kysely'
import { TABLES } from '../dbConstants'

export async function up(db: Kysely<any>) {
  await db.schema
    .alterTable(TABLES.PROJECT)
    .alterColumn('description', (col) => col.setDataType('varchar(4096)'))
    .execute()

  await db.schema
    .alterTable(TABLES.TASK)
    .alterColumn('description', (col) => col.setDataType('varchar(1000)'))
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema
    .alterTable(TABLES.PROJECT)
    .alterColumn('description', (col) => col.setDataType('varchar(1000)'))
    .execute()

  await db.schema
    .alterTable(TABLES.PROJECT)
    .alterColumn('description', (col) => col.setDataType('text'))
    .execute()
}
