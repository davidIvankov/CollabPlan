import { createTestDatabase } from '@tests/utils/database'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { createCallerFactory } from '@server/trpc'
import { clearTables, insertAll } from '@tests/utils/records'
import { TABLES } from '@server/database/dbConstants'
import { fakeUser } from '@server/entities/tests/fakes'
import userRouter from '..'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(userRouter)
const { search } = createCaller({ db })

describe('search', () => {
  const users = [
    fakeUser({ name: 'Alice Johnson', email: 'alice@example.com' }),
    fakeUser({ name: 'Bob Smith', email: 'bob@example.com' }),
    fakeUser({ name: 'Charlie Brown', email: 'charlie@example.com' }),
  ]

  beforeAll(async () => {
    await insertAll(db, TABLES.USER, users)
  })
  afterAll(async () => {
    await clearTables(db, [TABLES.USER])
  })

  it('should return users matching search query', async () => {
    const response = await search('Bob Smith')

    expect(response).toHaveLength(1)
    expect(response[0].name).toBe('Bob Smith')
  })

  it('should return an empty array if no users are found', async () => {
    const result = await search('Nonexistent User')

    expect(result).toEqual([])
  })
})
