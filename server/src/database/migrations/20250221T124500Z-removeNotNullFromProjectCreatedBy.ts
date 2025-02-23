import { Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
  await db.schema.alterTable('project').dropColumn('created_by').execute()

  await db.schema
    .alterTable('project')
    .addColumn('created_by', 'uuid', (column) =>
      column.references('user.id').onDelete('set null')
    )
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema.alterTable('project').dropColumn('created_by').execute()

  await db.schema
    .alterTable('project')
    .addColumn('created_by', 'uuid', (column) =>
      column.references('user.id').onDelete('set null').notNull()
    )
    .execute()
}
