import { Kysely, sql } from 'kysely'
import { TABLES } from '../dbConstants'

export async function up(db: Kysely<any>): Promise<void> {
  await sql`CREATE EXTENSION IF NOT EXISTS vector`.execute(db)
  await db.schema
    .alterTable(TABLES.TASK)
    .addColumn('embedding', sql`vector(512)`)
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable(TABLES.TASK).dropColumn('embedding').execute()
}
