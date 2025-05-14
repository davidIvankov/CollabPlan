import { createTestDatabase } from '@tests/utils/database'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { createCallerFactory } from '@server/trpc'
import { clearTables, insertAll } from '@tests/utils/records'
import { TABLES } from '@server/database/dbConstants'
import { fakeUser } from '@server/entities/tests/fakes'
import userRouter from '..'

const db = await wrapInRollbacks(createTestDatabase())
const [userOne, userTwo] = await insertAll(db, TABLES.USER, [
  fakeUser(),
  fakeUser({ email: 'fake@gmail.com' }),
])
const createCaller = createCallerFactory(userRouter)
const { getUser } = createCaller({ db, authUser: { id: userOne.id } })

describe('search', () => {
  afterAll(async () => {
    await clearTables(db, [TABLES.USER])
  })

  it('should return self if no argument provided', async () => {
    const { id, name, email } = userOne
    const response = await getUser()

    expect(response).toEqual({ id, name, email })
  })

  it('should return user if userId provided', async () => {
    const { id, name, email } = userTwo
    const response = await getUser(id)

    expect(response).toEqual({ id, name, email })
  })
})
