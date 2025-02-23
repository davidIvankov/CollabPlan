import {
  fakeProject,
  fakeUser,
  projectParticipantMatcher,
} from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { clearTables, insertAll, selectAll } from '@tests/utils/records'
import { TABLES } from '@server/database/dbConstants'
import projectParticipantRouter from '..'

const createCaller = createCallerFactory(projectParticipantRouter)
const db = await wrapInRollbacks(createTestDatabase())

// a general setup for the tests
await clearTables(db, [TABLES.PROJECT])
const [userOne, userTwo] = await insertAll(db, TABLES.USER, [
  fakeUser(),
  fakeUser({ email: 'fake@gmail.com' }),
])
const [project] = await insertAll(
  db,
  TABLES.PROJECT,
  fakeProject({ createdBy: userOne.id })
)

const { create } = createCaller({ db, authUser: { id: userOne.id } })

describe('create', () => {
  afterEach(async () => {
    await clearTables(db, [TABLES.PROJECT])
  })
  afterAll(async () => {
    await clearTables(db, [TABLES.USER])
  })

  it('creates project participant if input is valid', async () => {
    const insertion = await create({
      userId: userOne.id,
      projectId: project.id,
    })

    const projects = await selectAll(db, TABLES.PROJECT_PARTICIPANT)

    expect(insertion).toEqual(
      projectParticipantMatcher({ projectId: project.id, userId: userOne.id })
    )
    expect(projects).toEqual([insertion])
  })

  it('throws error if unauthorised user tries to add participant', async () => {
    await expect(
      createCaller({ db, authUser: { id: userTwo.id } }).create({
        projectId: project.id,
        userId: userTwo.id,
      })
    ).rejects.toThrow(/add participant to/)
  })
})
