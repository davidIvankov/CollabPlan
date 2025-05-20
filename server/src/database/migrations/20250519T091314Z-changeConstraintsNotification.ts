import { Kysely } from 'kysely'
import { TABLES } from '../dbConstants'

export async function up(db: Kysely<any>) {
  await db.schema
    .alterTable(TABLES.NOTIFICATION)
    .dropConstraint('notification_user_id_fk')

    .execute()

  await db.schema
    .alterTable(TABLES.NOTIFICATION)
    .dropConstraint('notification_project_id_fk')
    .execute()

  await db.schema
    .alterTable(TABLES.NOTIFICATION)
    .dropConstraint('notification_triggered_by_fk')
    .execute()

  await db.schema
    .alterTable(TABLES.NOTIFICATION)
    .dropColumn('user_id')
    .dropColumn('project_id')
    .dropColumn('triggered_by')
    .addColumn('user_id', 'uuid', (col) =>
      col.notNull().references('user.id').onDelete('cascade')
    )
    .addColumn('project_id', 'uuid', (col) =>
      col.notNull().references('project.id').onDelete('cascade')
    )
    .addColumn('triggered_by', 'uuid', (col) =>
      col.notNull().references('user.id').onDelete('cascade')
    )
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema
    .alterTable(TABLES.NOTIFICATION)
    .dropColumn('user_id')
    .dropColumn('project_id')
    .dropColumn('triggered_by')
    .execute()

  await db.schema
    .alterTable(TABLES.NOTIFICATION)
    .addColumn('user_id', 'uuid', (col) => col.notNull())
    .addColumn('project_id', 'uuid', (col) => col)
    .addColumn('triggered_by', 'uuid', (col) => col.notNull())
    .execute()
}
