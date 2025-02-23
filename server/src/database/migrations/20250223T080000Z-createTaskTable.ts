import { Kysely, sql } from 'kysely'

export const up = async (db: Kysely<any>) => {
  await db.schema.dropTable('task').execute()

  await db.schema
    .createTable('task')
    .addColumn('id', 'uuid', (c) =>
      c.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('project_id', 'uuid', (column) =>
      column.references('project.id').onDelete('cascade').notNull()
    )
    .addColumn('name', 'text', (column) => column.notNull())
    .addColumn('description', 'text')
    .addColumn('assigned_to', 'uuid', (column) =>
      column.references('user.id').onDelete('set null')
    )
    .addColumn('status', 'text', (column) =>
      column
        .notNull()
        .defaultTo('todo')
        .check(sql`status IN ('todo', 'in_progress', 'done')`)
    )
    .addColumn(
      'duration',
      'integer', // Duration in minutes (e.g., 120 = 2 hours)
      (column) => column.notNull()
    )
    .addColumn(
      'scheduled_time',
      'jsonb', // Same format as availability: { start: "...", end: "..." }
      (column) => column.defaultTo(sql`'{}'::jsonb`)
    )
    .addColumn('created_at', 'timestamp', (column) =>
      column.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute()
}

export const down = async (db: Kysely<any>) => {
  await db.schema.dropTable('task').execute()
}
