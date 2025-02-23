import { Kysely, sql } from 'kysely'
import { TABLES } from '../dbConstants'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable(TABLES.PROJECT_PARTICIPANT)
    .alterColumn('availability', (col) => col.setDefault(sql`'[]'::jsonb`))
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable(TABLES.PROJECT_PARTICIPANT)
    .alterColumn('availability', (col) => col.setDefault(sql`'{}'::jsonb`))
    .execute()
}
