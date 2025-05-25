import { wrapInRollbacks } from '@tests/utils/transactions'
import { createTestDatabase } from '@tests/utils/database'
import { insertAll } from '@tests/utils/records'
import { fakeUser } from '@server/entities/tests/fakes'
import { TABLES } from '@server/database/dbConstants'
import { passwordResetRepository } from '../passwordResetTokenRepository'

const db = await wrapInRollbacks(createTestDatabase())
const repository = passwordResetRepository(db)

const [user] = await insertAll(db, TABLES.USER, fakeUser())

describe('create', () => {
  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2023-01-01T10:00:00Z'))
  })

  afterAll(() => vi.useRealTimers())

  test('Token is saved in the database', async () => {
    const args = { token: 'some_token', userId: user.id }
    const insertion = await repository.create(args)

    expect(insertion).toEqual({
      ...args,
      expiresAt: new Date('2023-01-01T11:00:00Z'),
    })
  })
})
