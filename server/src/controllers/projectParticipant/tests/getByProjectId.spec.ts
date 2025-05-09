import { fakeProject, fakeUser } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { clearTables, insertAll } from '@tests/utils/records'
import { TABLES } from '@server/database/dbConstants'
import projectParticipantRouter from '..'

const createCaller = createCallerFactory(projectParticipantRouter)
const db = await wrapInRollbacks(createTestDatabase())

// a general setup for the tests
await clearTables(db, [TABLES.PROJECT])
const [userOne, userTwo] = await insertAll(db, TABLES.USER, [
  fakeUser(),
  fakeUser({ email: 'fake@gmail.com', name: 'Osas' }),
])
const [project] = await insertAll(db, TABLES.PROJECT, [
  fakeProject({ createdBy: userOne.id }),
])

const { getByProjectId } = createCaller({ db })

describe('GetByProjectId', () => {
  beforeAll(async () => {
    await insertAll(db, TABLES.PROJECT_PARTICIPANT, [
      { userId: userTwo.id, projectId: project.id },
    ])
  })

  afterAll(async () => {
    await clearTables(db, [TABLES.PROJECT, TABLES.USER])
  })

  it('returns names and roles of the project participants', async () => {
    const response = await getByProjectId(project.id)

    expect(response).toEqual([
      {
        userId: userTwo.id,
        name: userTwo.name,
        role: 'member',
        email: userTwo.email,
      },
    ])
  })
})
