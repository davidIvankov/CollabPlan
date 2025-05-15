// src/utils/mailer.ts
import config from '@server/config'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
})

export async function sendInvitationEmail(
  to: string,
  inviteLink: string
): Promise<void> {
  const subject = 'You’re invited to join Collab Plan!'

  const html = `
    <div style="font-family: sans-serif; padding: 16px;">
      <h2>You’re Invited 🎉</h2>
      <p>You’ve been invited to join <strong>Collab Plan</strong>.</p>
      <p>Click the button below to accept your invitation:</p>
      <a href="${inviteLink}" style="
        background-color: #4f46e5;
        color: white;
        padding: 10px 16px;
        border-radius: 5px;
        text-decoration: none;
        display: inline-block;
      ">Accept Invitation</a>
      <p>If the button doesn’t work, copy and paste this link into your browser:</p>
      <p>${inviteLink}</p>
      <hr />
      <p style="font-size: 12px; color: gray;">If you weren’t expecting this email, you can ignore it.</p>
    </div>
  `

  const text = `
You’ve been invited to join Collab Plan.

Click this link to accept your invitation:
${inviteLink}

If you weren’t expecting this email, you can ignore it.
  `

  try {
    await transporter.sendMail({
      from: '"Collab Plan" <collab.plan.app@gmail.com>',
      to,
      subject,
      text,
      html,
    })
    console.log(`✅ Invitation email sent to ${to}`)
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error)
    throw new Error('Failed to send invitation email.')
  }
}
