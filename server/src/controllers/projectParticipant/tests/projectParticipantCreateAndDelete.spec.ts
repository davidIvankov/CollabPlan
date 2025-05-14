import {
  fakeProject,
  fakeUser,
  projectParticipantMatcher,
} from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { clearTables, insertAll, selectAll } from '@tests/utils/records'
import { INVITATION_STATUS, TABLES } from '@server/database/dbConstants'
import projectParticipantRouter from '..'

const createCaller = createCallerFactory(projectParticipantRouter)
const db = await wrapInRollbacks(createTestDatabase())

// a general setup for the tests
await clearTables(db, [TABLES.PROJECT])
const [userOne, userTwo] = await insertAll(db, TABLES.USER, [
  fakeUser(),
  fakeUser({ email: 'fake@gmail.com' }),
])
const [project, projectTwo] = await insertAll(db, TABLES.PROJECT, [
  fakeProject({ createdBy: userOne.id }),
  fakeProject({ createdBy: userOne.id }),
])

const [invitation] = await insertAll(db, TABLES.INVITATIONS, [
  { projectId: project.id, invitedById: userOne.id, invitedUserId: userTwo.id },
])

const { create, remove } = createCaller({ db, authUser: { id: userOne.id } })

describe('create', () => {
  it('creates project participant if input is valid', async () => {
    const insertion = await create({
      id: invitation.id,
      projectId: project.id,
      status: INVITATION_STATUS.ACCEPTED,
    })

    const projectParticipants = await selectAll(db, TABLES.PROJECT_PARTICIPANT)

    expect(insertion).toEqual(
      projectParticipantMatcher({ projectId: project.id, userId: userOne.id })
    )
    expect(projectParticipants).toEqual([insertion])
  })

  it('updates invitation to declined if status is declined', async () => {
    const insertion = await create({
      id: invitation.id,
      projectId: project.id,
      status: INVITATION_STATUS.DECLINED,
    })

    const projectParticipants = await selectAll(db, TABLES.PROJECT_PARTICIPANT)

    expect(insertion).toMatchObject({ status: INVITATION_STATUS.DECLINED })
    expect(projectParticipants).toEqual([])
  })

  it('throws error if unauthorised user tries to add participant', async () => {
    await expect(
      createCaller({ db, authUser: { id: userTwo.id } }).create({
        projectId: projectTwo.id,
        id: invitation.id,
        status: INVITATION_STATUS.ACCEPTED,
      })
    ).rejects.toThrow(/Invitation not found/)
  })
})

describe('remove', () => {
  beforeAll(async () => {
    await insertAll(db, TABLES.PROJECT_PARTICIPANT, {
      userId: userTwo.id,
      projectId: project.id,
    })
  })

  afterAll(async () => {
    await clearTables(db, [
      TABLES.USER,
      TABLES.PROJECT,
      TABLES.PROJECT_PARTICIPANT,
    ])
  })

  it('deletes participant', async () => {
    const deletion = await remove({ userId: userTwo.id, projectId: project.id })

    expect(deletion).toMatchObject({
      userId: userTwo.id,
      projectId: project.id,
    })
  })

  it('throws error if non creator tres to delete', async () => {
    await expect(
      createCaller({ db, authUser: { id: userTwo.id } }).remove({
        projectId: projectTwo.id,
        userId: userOne.id,
      })
    ).rejects.toThrow(/remove participant from /)
  })
})
