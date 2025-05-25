export type InvitationTemplateVars = {
  inviterName: string
  projectName: string
  recipientName: string
  baseUrl?: string
}

export type ActivityTemplateVars = {
  projectName: string
  baseUrl?: string
}
export type PasswordResetArgs = {
  baseUrl?: string
  token: string
  userName: string
}
