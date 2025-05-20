import type { Database } from '@server/database'
import { TABLES } from '@server/database/dbConstants'
import {
  notificationKeysAll,
  type NotificationMarkAsSeenArgs,
  type NotificationRepoInsertable,
  type NotificationRepoInsertableInvitation,
  type NotificationResponse,
  type NotificationSelectable,
} from '@server/entities/notification'
import type { InvitationsInsertable } from '@server/entities/invitation'
import { type NotificationQuery } from '../entities/notification'

export function notificationRepository(db: Database) {
  return {
    async get({
      userId,
      type,
      page,
    }: NotificationQuery): Promise<NotificationResponse> {
      const limit = 5
      const offset = (page - 1) * limit
      const result = await db
        .selectFrom(TABLES.NOTIFICATION)
        .where('userId', '=', userId)
        .limit(limit + 1)
        .offset(offset)
        .where('type', '=', type)
        .orderBy('createdAt', 'desc')
        .select(notificationKeysAll)
        .execute()

      const hasMore = result.length > limit
      const data = result.slice(0, limit)

      return { data, hasMore }
    },
    async remove({
      projectId,
      invitedById,
      invitedUserId,
    }: InvitationsInsertable) {
      return db
        .deleteFrom(TABLES.NOTIFICATION)
        .where('projectId', '=', projectId)
        .where('triggeredBy', '=', invitedById)
        .where('userId', '=', invitedUserId)
        .returning(notificationKeysAll)
        .executeTakeFirst()
    },
    async markAsSeen({
      userId,
      id,
    }: NotificationMarkAsSeenArgs): Promise<
      NotificationSelectable | undefined
    > {
      return db
        .updateTable(TABLES.NOTIFICATION)
        .where('userId', '=', userId)
        .where('id', '=', id)
        .set({ seen: true })
        .returning(notificationKeysAll)
        .executeTakeFirst()
    },

    async createInvitationNotification(
      invitation: NotificationRepoInsertableInvitation
    ): Promise<NotificationSelectable> {
      return db
        .insertInto(TABLES.NOTIFICATION)
        .values(invitation)
        .returning(notificationKeysAll)
        .executeTakeFirstOrThrow()
    },
    async createProjectNotification(
      invitation: NotificationRepoInsertable
    ): Promise<NotificationSelectable> {
      return db
        .insertInto(TABLES.NOTIFICATION)
        .values(invitation)
        .returning(notificationKeysAll)
        .executeTakeFirstOrThrow()
    },
    async getLastEmailedActivityNotificationDate(
      projectId: string
    ): Promise<Date | undefined> {
      return db
        .selectFrom(TABLES.NOTIFICATION)
        .where('projectId', '=', projectId)
        .where('emailed', '=', true)
        .orderBy('createdAt', 'desc')
        .select(['createdAt'])
        .executeTakeFirst()
        .then((value) => (value ? value.createdAt : undefined))
    },
  }
}

export type NotificationRepository = ReturnType<typeof notificationRepository>
