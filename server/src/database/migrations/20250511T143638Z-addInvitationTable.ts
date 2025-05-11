import { sql, type Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('invitations')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(db.fn('gen_random_uuid'))
    )
    .addColumn('project_id', 'uuid', (column) =>
      column.references('project.id').onDelete('cascade').notNull()
    )
    .addColumn('invited_user_id', 'uuid', (column) =>
      column.references('user.id').onDelete('cascade').notNull()
    )
    .addColumn('invited_by_id', 'uuid', (column) =>
      column.references('user.id').onDelete('cascade').notNull()
    )
    .addColumn('status', 'text', (col) =>
      col
        .notNull()
        .defaultTo('pending')
        .check(sql`status IN ('pending', 'accepted', 'declined')`)
    )
    .addColumn('created_at', 'timestamp', (col) =>
      col.notNull().defaultTo(db.fn('now'))
    )
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable('invitations').execute()
}
