import { NOTIFICATION_TYPE } from '@server/database/dbConstants'
import type {
  NotificationInvitationInsertable,
  NotificationProjectInsertableNoUserId,
  NotificationSelectable,
} from '@server/entities/notification'
import { type NotificationRepository } from '@server/repositories/notificationRepository'
import {
  sendInvitationNotificationToUser,
  sendNotificationToUsers,
} from '@server/sse'

export function sendNotificationCreator<T>(template: (args: T) => string) {
  return async (
    args: T,
    notificationRepository: NotificationRepository,
    insertionArgs: NotificationInvitationInsertable
  ): Promise<NotificationSelectable> => {
    sendInvitationNotificationToUser(insertionArgs.userId)

    return notificationRepository.createInvitationNotification({
      message: template(args),
      type: NOTIFICATION_TYPE.INVITATION,
      ...insertionArgs,
    })
  }
}

export function groupNotificationCreator<T>(template: (args: T) => string) {
  return (
    args: T,
    repository: NotificationRepository,
    usersIds: string[],
    insertionArgsArrPartial: NotificationProjectInsertableNoUserId
  ): Promise<NotificationSelectable[]> => {
    sendNotificationToUsers(usersIds)

    const message = template(args)
    return Promise.all(
      usersIds.map((userId) =>
        repository.createInvitationNotification({
          message,
          type: NOTIFICATION_TYPE.PROJECT_UPDATE,
          userId,
          ...insertionArgsArrPartial,
        })
      )
    )
  }
}
