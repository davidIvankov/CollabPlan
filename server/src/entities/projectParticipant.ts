import { z } from 'zod'
import type { Insertable, Selectable } from 'kysely'
import type { ProjectParticipant } from '@server/database'
import { ROLE } from '@server/database/dbConstants'
import { availabilitySlotSchema, idSchema } from './shared'
import { invitationSchema } from './invitation'

export const availabilitySchema = z.array(availabilitySlotSchema).default([])

export const projectParticipantSchema = z.object({
  userId: idSchema,
  role: z.enum([ROLE.MEMBER, ROLE.ADMIN]),
  projectId: idSchema,
  availability: availabilitySchema,
})

export const projectParticipantKeysAll = Object.keys(
  projectParticipantSchema.shape
) as (keyof ProjectParticipant)[]

export const projectParticipantKeysPublic = projectParticipantKeysAll

export type ParticipantSelected = {
  name: string
  userId: string
  role: 'admin' | 'member'
  email: string
}

export const createUserParticipantSchema = invitationSchema.omit({
  createdAt: true,
  invitedById: true,
  invitedUserId: true,
})

export type ProjectParticipantPublic = Pick<
  Selectable<ProjectParticipant>,
  (typeof projectParticipantKeysPublic)[number]
>

export const projectParticipantInsertableSchema = projectParticipantSchema
  .omit({ availability: true })
  .partial({ role: true })

export const setAvailabilitySchema = z.object({
  projectId: idSchema,
  availability: z.object({ start: z.string(), end: z.string() }),
})

export const removeAvailabilitySchema = z.object({
  projectId: idSchema,
  scheduledTime: availabilitySlotSchema,
})

export const changeRoleSchema = projectParticipantSchema.pick({
  role: true,
  userId: true,
  projectId: true,
})

export type InsertableSetAvailability = {
  userId: string
  projectId: string
  availability: { start: string; end: string }
}

export type UpdateRoleInsertable = Insertable<
  Pick<ProjectParticipant, 'role' | 'userId' | 'projectId'>
>

export type ProjectParticipantInsertable = Insertable<
  Omit<ProjectParticipant, 'availability'> &
    Partial<Pick<ProjectParticipant, 'role'>>
>
