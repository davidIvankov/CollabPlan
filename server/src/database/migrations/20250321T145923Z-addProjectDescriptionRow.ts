import { Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
  await db.schema
    .alterTable('project')
    .addColumn('description', 'varchar(1000)')
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema.alterTable('project').dropColumn('description').execute()
}
