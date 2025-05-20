import type { MessageArgs, MessageArgsExtended } from './types'

export const invitationNotificationTemplate = (args: MessageArgs) =>
  `You have been invited to join the project "${args.projectName}" by ${args.triggeredByName}.`

export const taskCreationTemplate = (args: MessageArgs) =>
  `${args.triggeredByName} created a task in the project "${args.projectName}".`

export const taskCompletionTemplate = (args: MessageArgsExtended) =>
  `${args.triggeredByName} completed the task "${args.taskName}" in the project "${args.projectName}".`

export const taskDeletionTemplate = (args: MessageArgs) =>
  `${args.triggeredByName} deleted a task in the project "${args.projectName}".`

export const taskAssignmentTemplate = (args: MessageArgsExtended) =>
  `${args.triggeredByName} has been assigned the task "${args.taskName}" in the project "${args.projectName}".`

export const taskUnassignmentTemplate = (args: MessageArgsExtended) =>
  `${args.triggeredByName} has been unassigned from the task "${args.taskName}" in the project "${args.projectName}".`

export const projectDeletionTemplate = (args: MessageArgs) =>
  `The project "${args.projectName}" was deleted by ${args.triggeredByName}.`
