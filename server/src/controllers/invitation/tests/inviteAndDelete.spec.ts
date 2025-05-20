import { fakeProject, fakeUser } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { vi } from 'vitest'
import { clearTables, insertAll } from '@tests/utils/records'
import { INVITATION_STATUS, TABLES } from '@server/database/dbConstants'
import { emailService } from '@server/services/mailer'
import projectParticipantRouter from '..'

const createCaller = createCallerFactory(projectParticipantRouter)
const db = await wrapInRollbacks(createTestDatabase())

// a general setup for the tests
await clearTables(db, [TABLES.PROJECT])
const [userOne, userTwo, userThree] = await insertAll(db, TABLES.USER, [
  fakeUser(),
  fakeUser({ email: 'fake@gmail.com' }),
  fakeUser({ email: 'different@gmail.com' }),
])
const [project] = await insertAll(db, TABLES.PROJECT, [
  fakeProject({ createdBy: userOne.id }),
  fakeProject({ createdBy: userOne.id }),
])

vi.mock('@server/services/mailer', () => ({
  emailService: {
    sendInvitationEmail: vi.fn(() => Promise.resolve()),
  },
}))

const { invite, remove } = createCaller({ db, authUser: { id: userOne.id } })

describe('invite', () => {
  it('creates invitation if input is valid', async () => {
    const insertion = await invite({
      invitedUserId: userTwo.id,
      projectId: project.id,
    })

    expect(insertion).toMatchObject({
      invitedUserId: userTwo.id,
      projectId: project.id,
      invitedById: userOne.id,
    })

    expect(emailService.sendInvitationEmail).toBeCalledWith(userTwo.email, {
      recipientName: userTwo.name,
      projectName: project.name,
      inviterName: userOne.name,
    })
  })

  it('updates declined invitation', async () => {
    const [invitation] = await insertAll(db, TABLES.INVITATIONS, [
      {
        projectId: project.id,
        invitedById: userOne.id,
        invitedUserId: userThree.id,
        status: INVITATION_STATUS.DECLINED,
      },
    ])

    const mutation = await invite({
      invitedUserId: userThree.id,
      projectId: project.id,
    })

    expect(mutation).toEqual({
      ...invitation,
      status: INVITATION_STATUS.PENDING,
    })
  })

  it('throws error if unauthorised user tries to add invitation', async () => {
    await expect(
      createCaller({ db, authUser: { id: userTwo.id } }).invite({
        projectId: project.id,
        invitedUserId: userTwo.id,
      })
    ).rejects.toThrow(/invite participant to/)
  })
})

describe('remove', async () => {
  const [invitation] = await insertAll(db, TABLES.INVITATIONS, [
    {
      projectId: project.id,
      invitedById: userOne.id,
      invitedUserId: userTwo.id,
    },
  ])
  it('deletes invitation if authorized', async () => {
    const deletion = await remove({
      invitedUserId: userTwo.id,
      projectId: project.id,
    })

    expect(deletion).toEqual(invitation)
  })

  it('throws error if unauthorised user tries to delete invitation', async () => {
    await expect(
      createCaller({ db, authUser: { id: userTwo.id } }).remove({
        projectId: project.id,
        invitedUserId: userTwo.id,
      })
    ).rejects.toThrow(/You are not authorized to remove this invitation./)
  })
})
