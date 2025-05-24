import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
  await db.schema
    .alterTable('Task')
    .addColumn('actualDuration', 'integer')
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema.alterTable('Task').dropColumn('actualDuration').execute()
}
