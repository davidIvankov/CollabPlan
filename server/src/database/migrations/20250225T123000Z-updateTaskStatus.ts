import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>) {
  await db.schema
    .alterTable('task')
    .dropColumn('status') // Drop the existing column
    .execute()

  await db.schema
    .alterTable('task')
    .addColumn('status', 'text', (column) =>
      column
        .notNull()
        .defaultTo('todo')
        .check(sql`status IN ('todo', 'review', 'done')`)
    )
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema.alterTable('task').dropColumn('status').execute()

  await db.schema
    .alterTable('task')
    .addColumn('status', 'text', (column) =>
      column
        .notNull()
        .defaultTo('todo')
        .check(sql`status IN ('todo', 'in_progress', 'done')`)
    )
    .execute()
}
