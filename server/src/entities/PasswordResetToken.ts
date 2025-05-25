import type { PasswordResetToken } from '@server/database'
import type { Insertable } from 'kysely'
import { z } from 'zod'

export const passwordResetTokenSchema = z.object({
  token: z.string().min(10),
  userId: z.string().uuid(),
  expiresAt: z.coerce.date(),
})

export type PasswordResetTokenInsertable = Insertable<
  Omit<PasswordResetToken, 'expiresAt'>
>

export const passwordResetTokenKeysAll = Object.keys(
  passwordResetTokenSchema.shape
) as (keyof PasswordResetToken)[]
