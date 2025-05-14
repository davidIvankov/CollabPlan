import { createTestDatabase } from '@tests/utils/database'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { createCallerFactory } from '@server/trpc'
import { fakeUser } from '@server/entities/tests/fakes'
import { insertAll } from '@tests/utils/records'
import { TABLES } from '@server/database/dbConstants'
import router from '../index' // your router file

const createCaller = createCallerFactory(router)
const db = await wrapInRollbacks(createTestDatabase())

describe('clearDatabase (deleteAll) endpoint', () => {
  it('clears all relevant tables', async () => {
    await insertAll(db, TABLES.USER, [
      fakeUser(),
      fakeUser({ email: 'test2@example.com' }),
    ])

    const usersBefore = await db.selectFrom(TABLES.USER).selectAll().execute()
    expect(usersBefore).toHaveLength(2)

    const { deleteAll } = createCaller({ db })

    const response = await deleteAll()

    expect(response).toEqual({ success: true })

    const usersAfter = await db.selectFrom(TABLES.USER).selectAll().execute()
    expect(usersAfter).toHaveLength(0)
  })
})
