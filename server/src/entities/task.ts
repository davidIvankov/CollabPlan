import { z } from 'zod'
import type { Insertable, Selectable } from 'kysely'
import type { Task } from '@server/database'
import { TASK_STATUS } from '@server/database/dbConstants'
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
  status: z
    .enum([TASK_STATUS.TODO, TASK_STATUS.REVIEW, TASK_STATUS.DONE])
    .default(TASK_STATUS.DONE),
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

export const taskReviewSchema = z.object({
  description: stringSchema.nullable().default(null).optional(),
  id: idSchema,
  name: z.string().min(1).max(500).optional(),
  projectId: idSchema,
  status: z
    .enum([TASK_STATUS.TODO, TASK_STATUS.REVIEW, TASK_STATUS.DONE])
    .default(TASK_STATUS.DONE),
})

export type TaskAssignArguments = Insertable<Pick<Task, 'id' | 'projectId'>> & {
  userId: string
  scheduledTime: Slot
}
export type TaskReview = Insertable<
  Partial<
    Omit<
      Task,
      'assignedTo' | 'createdAt' | 'duration' | 'projectId' | 'scheduledTime'
    >
  >
> & { id: string }

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
