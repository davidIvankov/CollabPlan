import { sql, type Kysely } from 'kysely'
import { TABLES } from '../dbConstants'

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable(TABLES.NOTIFICATION)
    .addColumn('id', 'uuid', (c) =>
      c.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('user_id', 'uuid', (col) => col.notNull())
    .addColumn('type', 'text', (col) =>
      col.notNull().check(sql`type IN ('INVITATION', 'PROJECT_UPDATE')`)
    )
    .addColumn('message', 'text', (col) => col.notNull())
    .addColumn('project_id', 'uuid', (col) => col)
    .addForeignKeyConstraint(
      'notification_project_id_fk',
      ['project_id'],
      'project',
      ['id'],
      (fk) => fk.onDelete('set null')
    )
    .addColumn('seen', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('created_at', 'timestamp', (column) =>
      column.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addColumn('triggered_by', 'uuid', (col) => col.notNull())
    .addForeignKeyConstraint(
      'notification_triggered_by_fk',
      ['triggered_by'],
      'user',
      ['id'],
      (fk) => fk.onDelete('no action')
    )
    .addForeignKeyConstraint(
      'notification_user_id_fk',
      ['user_id'],
      'user',
      ['id'],
      (fk) => fk.onDelete('cascade')
    )
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable(TABLES.NOTIFICATION).execute()
}
