import { describe, it, expect, vi } from 'vitest'
import config from '@server/config'
import { emailService } from '..'
import {
  invitationTemplate,
  activityTemplate,
  SUBJECT_INVITATION,
  SUBJECT_ACTIVITY,
  passwordResetTemplate,
  SUBJECT_PASSWORD_RESET,
} from '../templates'
import { transporter } from '../mailer'

const MOCK_TEMPLATE_INVITATION = '<p>HTML content</p>'
const MOCK_TEXT_INVITATION = 'Text content'
const MOCK_TEMPLATE_ACTIVITY = '<p>Activity HTML content</p>'
const MOCK_TEXT_ACTIVITY = 'Activity Text content'
const MOCK_TEMPLATE_RESET = '<p>Reset HTML content</p>'
const MOCK_TEXT_RESET = 'Reset Text content'

vi.mock('../mailer', () => ({
  transporter: {
    sendMail: vi.fn(async () => Promise.resolve()),
  },
}))

vi.mock(import('../templates'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    invitationTemplate: {
      ...actual.invitationTemplate,
      generateHtml: vi.fn(() => MOCK_TEMPLATE_INVITATION),
      generateText: vi.fn(() => MOCK_TEXT_INVITATION),
    },
    activityTemplate: {
      ...actual.activityTemplate,
      generateHtml: vi.fn(() => MOCK_TEMPLATE_ACTIVITY),
      generateText: vi.fn(() => MOCK_TEXT_ACTIVITY),
    },
    passwordResetTemplate: {
      ...actual.passwordResetTemplate,
      generateHtml: vi.fn((args) => MOCK_TEMPLATE_RESET + JSON.stringify(args)),
      generateText: vi.fn((args) => MOCK_TEXT_RESET + JSON.stringify(args)),
    },
  }
})

const { sendInvitationEmail, sendActivityNotificationEmail, sendResetEmail } =
  emailService

describe('Template Senders', async () => {
  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2023-01-01T10:00:00Z'))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  afterAll(() => vi.useRealTimers())

  it('should send an invitation email with the correct template', async () => {
    const emailVars = {
      inviterName: 'John',
      projectName: 'Project X',
      recipientName: 'Jane',
      baseUrl: 'http//something/',
    }

    await sendInvitationEmail('test@example.com', emailVars)

    expect(invitationTemplate.generateHtml).toHaveBeenCalledWith(emailVars)
    expect(invitationTemplate.generateText).toHaveBeenCalledWith(emailVars)
    expect(transporter.sendMail).toHaveBeenCalledWith({
      from: `"CollabPlan" <${config.smtp.user}>`,
      to: 'test@example.com',
      subject: SUBJECT_INVITATION,
      html: MOCK_TEMPLATE_INVITATION,
      text: MOCK_TEXT_INVITATION,
    })
  })

  it('should send password reset email', async () => {
    const emailVars = {
      userName: 'John',
      token: 'test-token-123',
      baseUrl: 'http//something/',
    }

    await sendResetEmail('test@example.com', emailVars)

    expect(passwordResetTemplate.generateHtml).toHaveBeenCalledWith(emailVars)
    expect(passwordResetTemplate.generateText).toHaveBeenCalledWith(emailVars)
    expect(transporter.sendMail).toHaveBeenCalledWith({
      from: `"CollabPlan" <${config.smtp.user}>`,
      to: 'test@example.com',
      subject: SUBJECT_PASSWORD_RESET,
      html: MOCK_TEMPLATE_RESET + JSON.stringify(emailVars),
      text: MOCK_TEXT_RESET + JSON.stringify(emailVars),
    })
  })

  it('should send an activity notification email with the correct template if more then 24 h has passed since the last one', async () => {
    const emailVars = {
      baseUrl: 'http//something/',
      projectName: 'Project Y',
      recipientName: 'Doe',
    }

    await sendActivityNotificationEmail(
      ['notify@example.com', 'test@example.com'],
      emailVars,
      new Date('2022-01-01T00:00:00Z')
    )

    expect(activityTemplate.generateHtml).toHaveBeenCalledWith(emailVars)
    expect(activityTemplate.generateText).toHaveBeenCalledWith(emailVars)
    expect(transporter.sendMail).toHaveBeenCalledWith({
      from: `"CollabPlan" <${config.smtp.user}>`,
      to: ['notify@example.com', 'test@example.com'],
      subject: SUBJECT_ACTIVITY,
      html: MOCK_TEMPLATE_ACTIVITY,
      text: MOCK_TEXT_ACTIVITY,
    })
  })

  it('should send an activity notification email with the correct template if there was no previous notifications', async () => {
    const emailVars = {
      projectName: 'Project Y',
      recipientName: 'Doe',
      baseUrl: 'http//something/',
    }

    await sendActivityNotificationEmail(
      ['notify@example.com', 'test@example.com'],
      emailVars,
      undefined
    )

    expect(activityTemplate.generateHtml).toHaveBeenCalledWith(emailVars)
    expect(activityTemplate.generateText).toHaveBeenCalledWith(emailVars)
    expect(transporter.sendMail).toHaveBeenCalledWith({
      from: `"CollabPlan" <${config.smtp.user}>`,
      to: ['notify@example.com', 'test@example.com'],
      subject: SUBJECT_ACTIVITY,
      html: MOCK_TEMPLATE_ACTIVITY,
      text: MOCK_TEXT_ACTIVITY,
    })
  })

  it('should not send an activity notification email with the correct template if less then 24 h has passed since the last one', async () => {
    const emailVars = {
      projectName: 'Project Y',
      recipientName: 'Doe',
      baseUrl: 'http//something/',
    }

    const response = await sendActivityNotificationEmail(
      ['notify@example.com', 'test@example.com'],
      emailVars,
      new Date('2023-01-01T00:00:00Z')
    )

    expect(transporter.sendMail).not.toBeCalled()
    expect(response).toBe(false)
  })
})
