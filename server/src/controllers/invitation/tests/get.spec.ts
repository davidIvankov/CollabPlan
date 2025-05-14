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

const invitationContent = {
  projectId: project.id,
  invitedById: userOne.id,
  invitedUserId: userTwo.id,
}
const [invitation] = await insertAll(db, TABLES.INVITATIONS, [
  invitationContent,
])

const { getByProjectId } = createCaller({ db, authUser: { id: userOne.id } })

describe('getByProjectId', () => {
  it('get invitation list if authorized', async () => {
    const insertion = await getByProjectId(project.id)

    expect(insertion).toEqual([invitation])
  })

  it('throws error if unauthorised user tries to add participant', async () => {
    await expect(
      createCaller({ db, authUser: { id: userTwo.id } }).getByProjectId(
        project.id
      )
    ).rejects.toThrow(/to get invitations of/)
  })
})
