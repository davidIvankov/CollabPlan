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
const [projectOne, projectTwo] = await insertAll(db, TABLES.PROJECT, [
  fakeProject({ createdBy: userOne.id }),
  fakeProject({ createdBy: userTwo.id }),
])

const [invitationOne, invitationTwo] = await insertAll(db, TABLES.INVITATIONS, [
  {
    projectId: projectOne.id,
    invitedById: userOne.id,
    invitedUserId: userTwo.id,
  },
  {
    projectId: projectTwo.id,
    invitedById: userTwo.id,
    invitedUserId: userOne.id,
  },
])

const { getByProjectId, getByInvitedUserId } = createCaller({
  db,
  authUser: { id: userOne.id },
})

describe('getByProjectId', () => {
  it('get invitation list if authorized', async () => {
    const insertion = await getByProjectId(projectOne.id)

    expect(insertion).toEqual([invitationOne])
  })

  it('throws error if unauthorised user tries to add participant', async () => {
    await expect(
      createCaller({ db, authUser: { id: userTwo.id } }).getByProjectId(
        projectOne.id
      )
    ).rejects.toThrow(/to get invitations of/)
  })
})

describe('getByInvitedUserId', () => {
  it('get invitations list for single user', async () => {
    const response = await getByInvitedUserId()

    expect(response[0]).toMatchObject(invitationTwo)
  })
})
