export type MessageArgs = {
  projectName: string
  triggeredByName: string
}

export type MessageArgsExtended = MessageArgs & { taskName: string }
