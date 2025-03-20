import type { Database } from '@server/database'
import { TABLES } from '@server/database/dbConstants'
import type { User } from '@server/database/types'
import {
  type UserPublic,
  userKeysAll,
  userKeysPublic,
} from '@server/entities/user'
import type { Insertable, Selectable } from 'kysely'

export function userRepository(db: Database) {
  return {
    async create(user: Insertable<User>): Promise<UserPublic> {
      return db
        .insertInto(TABLES.USER)
        .values(user)
        .returning(userKeysPublic)
        .executeTakeFirstOrThrow()
    },
    async findByEmail(email: string): Promise<Selectable<User> | undefined> {
      const user = await db
        .selectFrom(TABLES.USER)
        .select(userKeysAll)
        .where('email', '=', email)
        .executeTakeFirst()

      return user
    },
    async search(query: string) {
      return db
        .selectFrom(TABLES.USER)
        .where(({ or, eb }) =>
          or([
            eb('name', '=', query), // Case-insensitive name search
            eb('email', '=', query), // Case-insensitive email search
          ])
        )
        .select(userKeysPublic)
        .execute()
    },
    async get(userId: string): Promise<UserPublic> {
      return db
        .selectFrom(TABLES.USER)
        .where('id', '=', userId)
        .select(userKeysPublic)
        .executeTakeFirstOrThrow()
    },
  }
}

export type UserRepository = ReturnType<typeof userRepository>
