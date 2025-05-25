import { createHash, randomBytes } from 'crypto'
import { createTestDatabase } from '@tests/utils/database'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { createCallerFactory } from '@server/trpc'
import { insertAll } from '@tests/utils/records'
import { TABLES } from '@server/database/dbConstants'
import { fakeUser } from '@server/entities/tests/fakes'
import { emailService } from '@server/services/mailer'
import userRouter from '..'

vi.mock('@server/services/mailer', () => ({
  emailService: {
    sendResetEmail: vi.fn(async () => Promise.resolve()),
  },
}))

const db = await wrapInRollbacks(createTestDatabase())
const [user] = await insertAll(db, TABLES.USER, [fakeUser()])
const rawTokenTwo = randomBytes(32).toString('hex')
const rawToken = randomBytes(32).toString('hex')
const tokenTwo = createHash('sha256').update(rawTokenTwo).digest('hex')
const token = createHash('sha256').update(rawToken).digest('hex')
await insertAll(db, TABLES.PASSWORD_RESET_TOKEN, [
  {
    token,
    userId: user.id,
    expiresAt: new Date('2023-01-01T11:00:00Z'),
  },
  {
    token: tokenTwo,
    userId: user.id,
    expiresAt: new Date('2023-01-01T09:00:00Z'),
  },
])

const createCaller = createCallerFactory(userRouter)
const { sendResetEmail, resetPassword } = createCaller({ db })

describe('sendResetEmail', () => {
  it('sends reset email if user with an email has an account', async () => {
    const response = await sendResetEmail(user.email)

    expect(emailService.sendResetEmail).toHaveBeenCalled()
    expect(response).toEqual({
      success: true,
      message: 'The password reset link has been sent.',
    })
  })

  it('responds similarly when there is user or not', async () => {
    const response = await sendResetEmail('fake@gmail.com')

    expect(emailService.sendResetEmail).toHaveBeenCalled()
    expect(response).toEqual({
      success: true,
      message: 'The password reset link has been sent.',
    })
  })
})

describe('resetPassword', () => {
  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2023-01-01T10:00:00Z'))
  })

  afterAll(() => vi.useRealTimers())

  it('resets password if right token is provided', async () => {
    const response = await resetPassword({
      password: 'newPassword',
      token: encodeURIComponent(rawToken),
    })

    expect(response).toEqual({
      completed: true,
      message: 'password reset was successful.',
    })
  })

  it('does not reset if token has expired', async () => {
    await expect(
      resetPassword({
        password: 'newPassword',
        token: encodeURIComponent(rawTokenTwo),
      })
    ).rejects.toThrow(/failed to reset password/)
  })
})
