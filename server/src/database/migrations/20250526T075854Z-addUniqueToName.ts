import { sql, type Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
  await db.executeQuery(
    sql`
    WITH duplicates AS (
  SELECT
    id,
    name,
    ROW_NUMBER() OVER (PARTITION BY name ORDER BY id) AS rn
  FROM "user"
)
UPDATE "user" u
SET name = CONCAT(u.name, '_', d.rn)
FROM duplicates d
WHERE u.id = d.id AND d.rn > 1;
  `.compile(db)
  )
  await db.schema
    .createIndex('user_name_unique')
    .on('user')
    .column('name')
    .unique()
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema
    .dropIndex('user_name_unique')
    .ifExists() // optional: avoids error if index was already dropped
    .execute()
}
