import { z } from 'zod'
import type { Insertable } from 'kysely'
import type { Task } from '@server/database'
import { availabilitySlotSchema, idSchema, stringSchema } from './shared'

export const taskSchema = z.object({
  assignedTo: idSchema.nullable().default(null),
  createdAt: z.date(),
  description: stringSchema.nullable().default(null),
  duration: z.number(),
  id: idSchema,
  name: z.string().min(1).max(500),
  projectId: idSchema,
  scheduledTime: z.union([availabilitySlotSchema, z.null()]),
  status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
})

export const taskKeysAll = Object.keys(taskSchema.shape) as (keyof Task)[]

export const taskInsertableSchema = taskSchema.omit({
  assignedTo: true,
  createdAt: true,
  id: true,
  scheduledTime: true,
  status: true,
})

export type TaskInsertable = Insertable<
  Omit<Task, 'assignedTo' | 'createdAt' | 'id' | 'scheduledTime' | 'status'>
>
