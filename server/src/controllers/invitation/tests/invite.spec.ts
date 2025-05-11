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
  fakeUser({ email: 'fake@gmail.com' }),
])
const [project] = await insertAll(db, TABLES.PROJECT, [
  fakeProject({ createdBy: userOne.id }),
  fakeProject({ createdBy: userOne.id }),
])

const { invite } = createCaller({ db, authUser: { id: userOne.id } })

describe('create', () => {
  it('creates project participant if input is valid', async () => {
    const insertion = await invite({
      invitedUserId: userTwo.id,
      projectId: project.id,
    })
    console.log(insertion)
  })

  it('throws error if unauthorised user tries to add participant', async () => {
    await expect(
      createCaller({ db, authUser: { id: userTwo.id } }).invite({
        projectId: project.id,
        invitedUserId: userTwo.id,
      })
    ).rejects.toThrow(/invite participant to/)
  })
})
