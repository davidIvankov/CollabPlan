import { trpc } from '@/trpc'
import type { NotificationResponse } from '@server/shared/types'
import { ref } from 'vue'

export const getProjectNotifications = trpc.notification.getProjectNotifications.query
export const getInvitationNotifications = trpc.notification.getInvitationNotifications.query

export const setSeen = trpc.notification.markAsSeen.mutate

export const notifications = ref<NotificationResponse>()
export const invitationNotifications = ref<NotificationResponse>()

export const refreshNotifications = async () => {
  notifications.value = await getProjectNotifications(1)
}

export const refreshInvitations = async () => {
  invitationNotifications.value = await getInvitationNotifications(1)
}

export const NOTIFICATION_TYPE = {
  INVITATION: 'INVITATION',
  PROJECT_UPDATE: 'PROJECT_UPDATE',
} as const
