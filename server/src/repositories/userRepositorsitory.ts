import type { Database } from '@server/database'
import { TABLES } from '@server/database/dbConstants'
import type { User } from '@server/database/types'
import {
  type ChangePassword,
  type UserPrivate,
  type UserPublic,
  userKeysAll,
  userKeysPrivate,
  userKeysPublic,
} from '@server/entities/user'
import type { Insertable, Selectable } from 'kysely'

export function userRepository(db: Database) {
  return {
    async create(user: Insertable<User>): Promise<UserPublic> {
      return db
        .insertInto(TABLES.USER)
        .values(user)
        .returning(userKeysPrivate)
        .executeTakeFirstOrThrow()
    },
    async updatePassword({
      password,
      id,
    }: ChangePassword): Promise<UserPublic> {
      return db
        .updateTable(TABLES.USER)
        .set({ password })
        .where('id', '=', id)
        .returning(userKeysPrivate)
        .executeTakeFirstOrThrow()
    },
    async findByEmail(email: string): Promise<Selectable<User> | undefined> {
      const user = await db
        .selectFrom(TABLES.USER)
        .select(userKeysAll)
        .where('email', '=', email)
        .select(userKeysPrivate)
        .executeTakeFirst()

      return user
    },
    async search(query: string) {
      return db
        .selectFrom(TABLES.USER)
        .where(({ or, eb }) =>
          or([
            eb('name', 'ilike', `%${query}%`), // Case-insensitive partial name search
          ])
        )
        .select(userKeysPublic)
        .execute()
    },
    async get(userId: string): Promise<UserPrivate> {
      return db
        .selectFrom(TABLES.USER)
        .where('id', '=', userId)
        .select(userKeysPrivate)
        .executeTakeFirstOrThrow()
    },
    async deleteAll(): Promise<void> {
      db.deleteFrom(TABLES.USER).execute()
    },
  }
}

export type UserRepository = ReturnType<typeof userRepository>
