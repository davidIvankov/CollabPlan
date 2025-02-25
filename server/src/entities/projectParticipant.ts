import { z } from 'zod'
import type { Insertable, Selectable } from 'kysely'
import type { ProjectParticipant } from '@server/database'
import { availabilitySlotSchema, idSchema } from './shared'

export const availabilitySchema = z.array(availabilitySlotSchema).default([])

export const projectParticipantSchema = z.object({
  userId: idSchema,
  role: z.enum(['member', 'admin']),
  projectId: idSchema,
  availability: availabilitySchema,
})

export const projectParticipantKeysAll = Object.keys(
  projectParticipantSchema.shape
) as (keyof ProjectParticipant)[]

export const projectParticipantKeysPublic = projectParticipantKeysAll

export type ProjectParticipantPublic = Pick<
  Selectable<ProjectParticipant>,
  (typeof projectParticipantKeysPublic)[number]
>

export const projectParticipantInsertableSchema = projectParticipantSchema
  .omit({ availability: true })
  .partial({ role: true })

export const setAvailabilitySchema = projectParticipantSchema.omit({
  role: true,
  userId: true,
})

export const changeRoleSchema = projectParticipantSchema.pick({
  role: true,
  userId: true,
  projectId: true,
})

export type InsertableSetAvailability = {
  userId: string
  projectId: string
  availability: { start: string; end: string }[]
}

export type UpdateRoleInsertable = Insertable<
  Pick<ProjectParticipant, 'role' | 'userId' | 'projectId'>
>

export type ProjectParticipantInsertable = Insertable<
  Omit<ProjectParticipant, 'availability'> &
    Partial<Pick<ProjectParticipant, 'role'>>
>
