import { createCallerFactory } from '@server/trpc'
import { TABLES } from '@server/database/dbConstants'
import { fakeProject, fakeUser } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { clearTables, insertAll, selectAll } from '@tests/utils/records'
import { wrapInRollbacks } from '@tests/utils/transactions'
import projectRouter from '..'

const createCaller = createCallerFactory(projectRouter)
const db = await wrapInRollbacks(createTestDatabase())

// a general setup for the tests
await clearTables(db, [TABLES.PROJECT])
const [user] = await insertAll(db, TABLES.USER, fakeUser())
await insertAll(db, TABLES.PROJECT, [
  fakeProject({ createdBy: user.id }),
  fakeProject({ createdBy: user.id }),
])

const [projectOne, projectTwo] = await selectAll(db, TABLES.PROJECT)

const { getByCreatedBy } = createCaller({ db })

describe('getById', () => {
  afterAll(async () => {
    await clearTables(db, [TABLES.PROJECT, TABLES.USER])
  })
  it('should return the project if it exists', async () => {
    const response = await getByCreatedBy(user.id)

    expect(response).toEqual([projectOne, projectTwo])
  })
})
