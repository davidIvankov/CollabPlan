export const TABLES = {
  USER: 'user',
  PROJECT: 'project',
  PROJECT_PARTICIPANT: 'projectParticipant',
  TASK: 'task',
  INVITATIONS: 'invitations',
  NOTIFICATION: 'notification',
  PASSWORD_RESET_TOKEN: 'passwordResetToken',
} as const

export const TASK_STATUS = {
  TODO: 'todo',
  REVIEW: 'review',
  DONE: 'done',
} as const

export const NOTIFICATION_TYPE = {
  INVITATION: 'INVITATION',
  PROJECT_UPDATE: 'PROJECT_UPDATE',
} as const

export const INVITATION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
} as const

export const ROLE = {
  MEMBER: 'member',
  ADMIN: 'admin',
} as const
