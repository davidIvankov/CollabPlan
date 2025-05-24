import { z } from 'zod'
import type { Insertable, Selectable } from 'kysely'
import type { Task } from '@server/database'
import { TASK_STATUS } from '@server/database/dbConstants'
import {
  availabilitySlotSchema,
  idSchema,
  messageSchema,
  stringSchema,
  vector,
  type Slot,
} from './shared'

export const taskSchema = z.object({
  assignedTo: idSchema.nullable().default(null),
  embedding: vector,
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
  actualDuration: z.number().nullable().default(null),
})

export const taskKeysAll = Object.keys(taskSchema.shape) as (keyof Task)[]
export const taskKeysPublic = taskKeysAll.filter(
  (key) => key !== 'embedding'
) as (keyof Task)[]

export const taskInsertableSchema = taskSchema.omit({
  assignedTo: true,
  createdAt: true,
  id: true,
  scheduledTime: true,
  status: true,
  embedding: true,
})

export const taskDurationEstimationSchema = taskInsertableSchema
  .omit({
    duration: true,
  })
  .extend({ messages: z.array(messageSchema) })

export type TaskEmbedQueryParams = Omit<
  z.infer<typeof taskDurationEstimationSchema>,
  'messages'
>

export const taskAssignSchema = z.object({
  id: idSchema,
  scheduledTime: availabilitySlotSchema,
})

export const taskRemoveSchema = taskSchema.pick({ id: true, projectId: true })

export const taskReviewSchema = z.object({
  description: stringSchema.nullable().default(null).optional(),
  id: idSchema,
  name: z.string().min(1).max(500).optional(),
  projectId: idSchema,
  status: z
    .enum([TASK_STATUS.TODO, TASK_STATUS.REVIEW, TASK_STATUS.DONE])
    .default(TASK_STATUS.DONE),
})

export type TaskPrompt = {
  projectName: string
  taskName: string
  description: string | null
}

export const setDoneSchema = taskSchema.pick({ id: true, actualDuration: true })

export type SetDoneArgs = Pick<
  TaskSelectable,
  'id' | 'actualDuration' | 'embedding'
>

export const documentKeys = [
  'task.id as id',
  'task.name as name',
  'project.name as projectName',
  'task.description as description',
  'project.description as projectDescription',
  'duration as estimatedDuration',
  'actualDuration',
] as const

export type DocumentParams = {
  id: string
  name: string
  projectName: string
  description: string | null
  projectDescription: string | null
  estimatedDuration: number
  actualDuration: number | null
}

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

export type TaskSelectable = Selectable<Task>
export type TaskPublic = Omit<TaskSelectable, 'embedding'>
export type TaskInsertable = Insertable<
  Omit<Task, 'assignedTo' | 'createdAt' | 'id' | 'scheduledTime' | 'status'>
>
