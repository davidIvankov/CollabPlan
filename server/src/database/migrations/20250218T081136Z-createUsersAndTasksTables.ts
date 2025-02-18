import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>) {
  // Create the `users` table
  await db.schema
    .createTable('user')
    .addColumn('id', 'uuid', (c) =>
      c.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('name', 'text', (column) => column.notNull())
    .addColumn('email', 'text', (column) => column.unique().notNull())
    .addColumn('availability', 'jsonb', (column) =>
      column.notNull().defaultTo('{}')
    )
    .execute()

  // Create the `projects` table
  await db.schema
    .createTable('project')
    .addColumn('id', 'uuid', (c) =>
      c.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('name', 'text', (column) => column.notNull())
    .addColumn('created_by', 'uuid', (column) =>
      column.references('user.id').onDelete('set null').notNull()
    )
    .addColumn('created_at', 'timestamp', (column) =>
      column.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute()

  // Create the `project_participants` table
  await db.schema
    .createTable('project_participant')
    .addColumn('project_id', 'uuid', (column) =>
      column.references('project.id').onDelete('cascade').notNull()
    )
    .addColumn('user_id', 'uuid', (column) =>
      column.references('user.id').onDelete('cascade').notNull()
    )
    .addColumn('role', 'text', (column) =>
      column
        .notNull()
        .defaultTo('member')
        .check(sql`role IN ('admin', 'member')`)
    )
    .addPrimaryKeyConstraint('project_user_pkey', ['project_id', 'user_id'])
    .execute()

  // Create the `tasks` table
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
    .addColumn(
      'status',
      'text',
      (column) =>
        column
          .notNull()
          .defaultTo('todo')
          .check(sql`status IN ('todo', 'in_progress', 'done')`) // Added check constraint
    )
    .addColumn('order_index', 'integer', (column) => column.notNull())
    .addColumn('depends_on', sql`uuid[]`, (column) => column.defaultTo('{}'))
    .addColumn('created_at', 'timestamp', (column) =>
      column.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute()
}

export async function down(db: Kysely<any>) {
  // Drop the `tasks` table
  await db.schema.dropTable('task').ifExists().execute()

  // Drop the `project_participants` table
  await db.schema.dropTable('project_participant').ifExists().execute()

  // Drop the `projects` table
  await db.schema.dropTable('project').ifExists().execute()

  // Drop the `users` table
  await db.schema.dropTable('user').ifExists().execute()
}
