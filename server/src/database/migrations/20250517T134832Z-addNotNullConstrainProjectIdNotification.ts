import { Kysely } from 'kysely'
import { TABLES } from '../dbConstants'

export async function up(db: Kysely<any>) {
  await db.schema
    .alterTable(TABLES.NOTIFICATION)
    .alterColumn('project_id', (col) => col.setNotNull())
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema
    .alterTable(TABLES.NOTIFICATION)
    .alterColumn('task_id', (col) => col.setNotNull())
    .alterColumn('project_id', (col) => col.dropNotNull())
    .execute()
}
