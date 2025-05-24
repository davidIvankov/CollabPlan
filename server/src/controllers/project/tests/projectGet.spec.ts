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
const [userOne, userTwo] = await insertAll(db, TABLES.USER, [
  fakeUser(),
  fakeUser({ email: 'antonio@gmail.com' }),
])
const { id } = userOne
await insertAll(db, TABLES.PROJECT, [
  fakeProject({ createdBy: userOne.id }),
  fakeProject({ createdBy: userTwo.id }),
])

const [projectOne, projectTwo] = await selectAll(db, TABLES.PROJECT)

const { getById, getByCreatedBy } = createCaller({
  db,
  authUser: { id: userTwo.id },
})

describe('getById', () => {
  it('should return the project if it exists', async () => {
    const response = await getById(projectOne.id)

    expect(response).toEqual(projectOne)
  })

  it('should throw a NOT_FOUND error if project does not exist', async () => {
    await expect(getById(id)).rejects.toThrow(/not found/)
  })
})

describe('getByCreatedBy', () => {
  afterAll(async () => {
    await clearTables(db, [TABLES.PROJECT, TABLES.USER])
  })
  it('should return the project if it exists', async () => {
    const response = await getByCreatedBy(userOne.id)

    expect(response).toEqual([projectOne])
  })

  it('should return an empty array if user has no projects', async () => {
    const response = await getByCreatedBy()
    expect(response).toEqual([projectTwo])
  })
})
