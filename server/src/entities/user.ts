import { z } from 'zod'
import type { Insertable, Selectable } from 'kysely'
import type { User } from '@server/database/types'
import { emailSchema, idSchema, passwordSchema } from './shared'

export const userSchema = z.object({
  id: idSchema,
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(1).max(500),
})

// list keys that we will return to the client
export const userKeysAll = Object.keys(userSchema.shape) as (keyof User)[]

export const userKeysPublic = ['id', 'name'] as const

export const userKeysPrivate = ['id', 'name', 'email'] as const

export const userKeysProjectNotification = ['user.id as id', 'email'] as const

export type UserProjectNotification = Selectable<Pick<User, 'id'>>

export type UserPrivate = Pick<
  Selectable<User>,
  (typeof userKeysPrivate)[number]
>
export type UserPublic = Pick<Selectable<User>, (typeof userKeysPublic)[number]>

// a specific schema for authenticated user that is used in JWT
export const authUserSchema = userSchema.pick({ id: true })
export type AuthUser = z.infer<typeof authUserSchema>

export type ChangePassword = Omit<Insertable<User>, 'name' | 'email'> & {
  id: string
}
