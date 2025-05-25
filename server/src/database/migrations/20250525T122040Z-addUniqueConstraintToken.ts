import type { Kysely } from 'kysely'
import { TABLES } from '../dbConstants'

export async function up(db: Kysely<any>) {
  await db.schema.dropTable(TABLES.PASSWORD_RESET_TOKEN).ifExists().execute()

  await db.schema
    .createTable(TABLES.PASSWORD_RESET_TOKEN)
    .addColumn('token', 'text', (col) => col.primaryKey().notNull())
    .addColumn('user_id', 'uuid', (col) =>
      col.notNull().references('user.id').onDelete('cascade')
    )
    .addColumn('expires_at', 'timestamptz', (col) => col.notNull())
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable(TABLES.PASSWORD_RESET_TOKEN).execute()
}
