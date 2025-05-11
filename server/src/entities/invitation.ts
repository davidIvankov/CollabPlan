import { z } from 'zod'
import type { Invitations } from '@server/database'
import { INVITATION_STATUS } from '@server/database/dbConstants'
import { idSchema } from './shared'

export const invitationSchema = z.object({
  createdAt: z.date().default(() => new Date()),
  id: idSchema,
  invitedById: idSchema,
  invitedUserId: idSchema,
  projectId: idSchema,
  status: z.enum([
    INVITATION_STATUS.ACCEPTED,
    INVITATION_STATUS.PENDING,
    INVITATION_STATUS.DECLINED,
  ]),
})

export const invitationInputSchema = invitationSchema.pick({
  invitedUserId: true,
  projectId: true,
})

export const invitationKeysAll = Object.keys(
  invitationSchema.shape
) as (keyof Invitations)[]
