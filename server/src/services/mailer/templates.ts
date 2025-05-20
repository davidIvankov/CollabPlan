import type { ActivityTemplateVars, InvitationTemplateVars } from './types'

export const SUBJECT_INVITATION = 'You have been invited to a project'
export const SUBJECT_ACTIVITY = 'New activity on your project'
const PROJECT_LINK =
  'https://collabplan.f9zj85wh85y6m.eu-central-1.cs.amazonlightsail.com/'

export const invitationTemplate = {
  subject: SUBJECT_INVITATION,
  generateHtml: (vars: InvitationTemplateVars) => `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>Hello${vars.recipientName ? ` ${vars.recipientName}` : ''},</h2>
      <p><strong>${vars.inviterName}</strong> has invited you to join the project <strong>${vars.projectName}</strong>.</p>
      <p>Click the button below to accept the invitation:</p>
      <p>
        <a href="${PROJECT_LINK}" style="
          display: inline-block;
          padding: 10px 20px;
          background-color: #4f46e5;
          color: white;
          text-decoration: none;
          border-radius: 5px;
        ">Accept Invitation</a>
      </p>
      <p>If you weren’t expecting this, feel free to ignore this email.</p>
      <p>– The CollabPlan Team</p>
    </div>
  `,
  generateText: (vars: InvitationTemplateVars) =>
    `
Hello${vars.recipientName ? ` ${vars.recipientName}` : ''},

${vars.inviterName} has invited you to join the project ${vars.projectName}.

If you weren’t expecting this invitation, you can safely ignore this email.

Best,
The CollabPlan Team
  `.trim(),
} as const

export const activityTemplate = {
  subject: SUBJECT_ACTIVITY,
  generateHtml: (vars: ActivityTemplateVars) => `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
    <h1>Hello dear user</h1>
      <p>There is new activity on the project <strong>${vars.projectName}</strong> you are participating in.</p>
      <p>Visit the project to see the updates.</p>
      <p>– The CollabPlan Team</p>
      <p>
        <a href="${PROJECT_LINK}" style="
          display: inline-block;
          padding: 10px 20px;
          background-color: #4f46e5;
          color: white;
          text-decoration: none;
          border-radius: 5px;
        ">CollabPlan</a>
      </p>
    </div>
  `,
  generateText: (vars: ActivityTemplateVars) =>
    `
Hello dear user,

There is new activity on the project ${vars.projectName}.

Visit the project to see the updates.

Best,
The CollabPlan Team
  `.trim(),
} as const
