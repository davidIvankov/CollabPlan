import { Kysely } from 'kysely'
import { TABLES } from '../dbConstants'

export async function up(db: Kysely<any>) {
  await db.schema
    .alterTable(TABLES.NOTIFICATION)
    .dropColumn('task_id')
    .addColumn('task_id', 'uuid', (col) =>
      col.references('task.id').onDelete('cascade')
    )
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema
    .alterTable('notification')
    .alterColumn('task_id', (col) => col.setNotNull())
    .execute()
}
