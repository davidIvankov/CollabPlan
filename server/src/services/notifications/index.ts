import {
  invitationNotificationTemplate,
  projectDeletionTemplate,
  taskAssignmentTemplate,
  taskCompletionTemplate,
  taskCreationTemplate,
  taskDeletionTemplate,
  taskUnassignmentTemplate,
} from './messageTemplates'
import {
  groupNotificationCreator,
  sendNotificationCreator,
} from './sendNotificationCreator'

export const notificationService = {
  invitation: sendNotificationCreator(invitationNotificationTemplate),
  createdTask: groupNotificationCreator(taskCreationTemplate),
  completedTask: groupNotificationCreator(taskCompletionTemplate),
  deletedTask: groupNotificationCreator(taskDeletionTemplate),
  assignedTask: groupNotificationCreator(taskAssignmentTemplate),
  unassignedTask: groupNotificationCreator(taskUnassignmentTemplate),
  deletedProject: groupNotificationCreator(projectDeletionTemplate),
}

export type NotificationService = typeof notificationService
