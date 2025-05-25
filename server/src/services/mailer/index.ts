import config from '@server/config'
import { transporter } from './mailer'
import {
  SUBJECT_ACTIVITY,
  SUBJECT_INVITATION,
  invitationTemplate,
  activityTemplate,
  passwordResetTemplate,
  SUBJECT_PASSWORD_RESET,
} from './templates'

type TemplateSender<TVars> = (to: string, vars: TVars) => Promise<void>

type TemplateSenderActivity<TVars> = (
  to: string[],
  vars: TVars,
  lastSentAt: Date | undefined
) => Promise<boolean>

export function createTemplateSender<TVars>(template: {
  subject: typeof SUBJECT_INVITATION | typeof SUBJECT_PASSWORD_RESET
  generateHtml: (vars: TVars) => string
  generateText?: (vars: TVars) => string
}): TemplateSender<TVars>

export function createTemplateSender<TVars>(template: {
  subject: typeof SUBJECT_ACTIVITY
  generateHtml: (vars: TVars) => string
  generateText?: (vars: TVars) => string
}): TemplateSenderActivity<TVars>

export function createTemplateSender<TVars>(template: {
  subject:
    | typeof SUBJECT_ACTIVITY
    | typeof SUBJECT_INVITATION
    | typeof SUBJECT_PASSWORD_RESET
  generateHtml: (vars: TVars) => string
  generateText?: (vars: TVars) => string
}): any {
  let result: TemplateSender<TVars> | TemplateSenderActivity<TVars>
  if (template.subject !== SUBJECT_ACTIVITY) {
    result = async (to: string, vars: TVars) => {
      await transporter.sendMail({
        from: `"CollabPlan" <${config.smtp.user}>`,
        to,
        subject: template.subject,
        html: template.generateHtml(vars),
        text: template.generateText?.(vars),
      })
    }
  } else {
    result = async (
      to: string[],
      vars: TVars,
      lastSentAt: Date | undefined
    ) => {
      const hoursOld = lastSentAt
        ? (new Date().getTime() - lastSentAt.getTime()) / (1000 * 60 * 60)
        : 40
      const isOlder = hoursOld >= 24
      if (isOlder && to.length) {
        try {
          transporter.sendMail({
            from: `"CollabPlan" <${config.smtp.user}>`,
            to,
            subject: template.subject,
            html: template.generateHtml(vars),
            text: template.generateText?.(vars),
          })
        } catch (err) {
          console.log(err)
        }

        return isOlder
      }

      return isOlder
    }
  }
  return result
}

export const emailService = {
  sendInvitationEmail: createTemplateSender(invitationTemplate),
  sendActivityNotificationEmail: createTemplateSender(activityTemplate),
  sendResetEmail: createTemplateSender(passwordResetTemplate),
}
