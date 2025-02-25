import { z } from 'zod'
import type { Insertable, Selectable } from 'kysely'
import type { Task } from '@server/database'
import {
  availabilitySlotSchema,
  idSchema,
  stringSchema,
  type Slot,
} from './shared'

export const taskSchema = z.object({
  assignedTo: idSchema.nullable().default(null),
  createdAt: z.date().default(() => new Date()),
  description: stringSchema.nullable().default(null),
  duration: z.number(),
  id: idSchema,
  name: z.string().min(1).max(500),
  projectId: idSchema,
  scheduledTime: z.union([availabilitySlotSchema, z.null()]),
  status: z.enum(['todo', 'review', 'done']).default('todo'),
})

export const taskKeysAll = Object.keys(taskSchema.shape) as (keyof Task)[]

export const taskInsertableSchema = taskSchema.omit({
  assignedTo: true,
  createdAt: true,
  id: true,
  scheduledTime: true,
  status: true,
})

export const taskAssignSchema = z.object({
  id: idSchema,
  scheduledTime: availabilitySlotSchema,
  projectId: idSchema,
})

export type TaskAssignArguments = Insertable<
  Pick<Task, 'id' | 'scheduledTime' | 'projectId'>
> & {
  userId: string
}

export type TaskAssignArgumentsRepo = Insertable<{
  id: string
  scheduledTime: Slot
  userId: string
}>

export type TaskSelectable = Pick<
  Selectable<Task>,
  (typeof taskKeysAll)[number]
>
export type TaskInsertable = Insertable<
  Omit<Task, 'assignedTo' | 'createdAt' | 'id' | 'scheduledTime' | 'status'>
>
