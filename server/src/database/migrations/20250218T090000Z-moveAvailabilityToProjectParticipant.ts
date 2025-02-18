import { Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
  // Add the `availability` column to the `project_participant` table
  await db.schema
    .alterTable('project_participant')
    .addColumn('availability', 'jsonb', (column) =>
      column.notNull().defaultTo('{}')
    )
    .execute()

  // Remove the `availability` column from the `user` table
  await db.schema.alterTable('user').dropColumn('availability').execute()
}

export async function down(db: Kysely<any>) {
  // Rollback changes: remove `availability` from `project_participant`
  await db.schema
    .alterTable('project_participant')
    .dropColumn('availability')
    .execute()

  // Rollback changes: add `availability` back to `user`
  await db.schema
    .alterTable('user')
    .addColumn('availability', 'jsonb', (column) =>
      column.notNull().defaultTo('{}')
    )
    .execute()
}
