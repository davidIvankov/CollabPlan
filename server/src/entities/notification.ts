import type { Insertable, Selectable } from 'kysely'
import type { Notification } from '@server/database'
import { z } from 'zod'
import { NOTIFICATION_TYPE } from '../database/dbConstants'
import { idSchema } from './shared'

export const notificationSchema = z.object({
  createdAt: z.date().default(() => new Date()),
  message: z.string(),
  emailed: z.boolean().default(false),
  id: idSchema,
  userId: idSchema,
  projectId: idSchema,
  seen: z.boolean().default(false),
  taskId: idSchema,
  triggeredBy: idSchema,
  type: z.enum([
    NOTIFICATION_TYPE.INVITATION,
    NOTIFICATION_TYPE.PROJECT_UPDATE,
  ]),
})

export type NotificationQuery = {
  userId: string
  type: NotificationType
  page: number
}

export type NotificationType =
  | typeof NOTIFICATION_TYPE.INVITATION
  | typeof NOTIFICATION_TYPE.PROJECT_UPDATE

export type NotificationRepoInsertable = Insertable<
  Omit<Notification, 'createdAt' | 'id' | 'seen'>
>
export type NotificationRepoInsertableInvitation = Insertable<
  Omit<Notification, 'taskId'>
>

export type NotificationProjectInsertable = Omit<
  NotificationRepoInsertable,
  'createdAt' | 'id' | 'message' | 'seen' | 'type'
>
export type NotificationProjectInsertableNoUserId = Omit<
  NotificationProjectInsertable,
  'userId'
>

export type NotificationInvitationInsertable = Omit<
  NotificationProjectInsertable,
  'taskId'
>

export const notificationKeysAll = Object.keys(
  notificationSchema.shape
) as (keyof Notification)[]

export type NotificationSelectable = Pick<
  Selectable<Notification>,
  (typeof notificationKeysAll)[number]
>

export type NotificationResponse = {
  data: NotificationSelectable[]
  hasMore: boolean
}

export type NotificationMarkAsSeenArgs = { id: string; userId: string }
