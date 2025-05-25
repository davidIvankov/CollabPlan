import type { Database } from '@server/database'
import { TABLES } from '@server/database/dbConstants'
import type { PasswordResetToken } from '@server/database/types'
import {
  passwordResetTokenKeysAll,
  type PasswordResetTokenInsertable,
} from '@server/entities/PasswordResetToken'
import type { Selectable } from 'kysely'

export function passwordResetRepository(db: Database) {
  return {
    async create(
      passwordResetToken: PasswordResetTokenInsertable
    ): Promise<Selectable<PasswordResetToken>> {
      const expiresAt = new Date(Date.now() + 3600000)

      return db
        .insertInto(TABLES.PASSWORD_RESET_TOKEN)
        .values({ ...passwordResetToken, expiresAt })
        .returning(passwordResetTokenKeysAll)
        .executeTakeFirstOrThrow()
    },
    async remove(
      token: string
    ): Promise<Selectable<PasswordResetToken> | undefined> {
      return db
        .deleteFrom(TABLES.PASSWORD_RESET_TOKEN)
        .where('token', '=', token)
        .where('expiresAt', '>', new Date())
        .returning(passwordResetTokenKeysAll)
        .executeTakeFirst()
    },
  }
}

export type PasswordResetTokenRepository = ReturnType<
  typeof passwordResetRepository
>
