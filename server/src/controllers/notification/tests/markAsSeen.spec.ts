import { fakeProject, fakeUser } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
import { NOTIFICATION_TYPE, TABLES } from '@server/database/dbConstants'
import notificationRouter from '..'

const createCaller = createCallerFactory(notificationRouter)
const db = await wrapInRollbacks(createTestDatabase())

const [userOne, userTwo] = await insertAll(db, TABLES.USER, [
  fakeUser(),
  fakeUser({ email: 'fake@gmail.com' }),
])
const [projectOne] = await insertAll(db, TABLES.PROJECT, [
  fakeProject({ createdBy: userOne.id }),
])

const [notificationInvitation] = await insertAll(db, TABLES.NOTIFICATION, [
  {
    message: 'hello',
    type: NOTIFICATION_TYPE.INVITATION,
    projectId: projectOne.id,
    userId: userOne.id,
    triggeredBy: userTwo.id,
  },
  {
    message: 'hello',
    type: NOTIFICATION_TYPE.PROJECT_UPDATE,
    projectId: projectOne.id,
    userId: userOne.id,
    triggeredBy: userTwo.id,
    createdAt: new Date('2025-05-17T12:00:00.000Z'),
  },
])

const { markAsSeen } = createCaller({
  db,
  authUser: { id: userOne.id },
})

describe('markAsSeen', () => {
  it('marks notification as seen', async () => {
    const response = await markAsSeen(notificationInvitation.id)

    expect(response).toEqual({ ...notificationInvitation, seen: true })
  })

  it('throws error if unauthorized user tries to do it', async () => {
    await expect(
      createCaller({
        db,
        authUser: { id: userTwo.id },
      }).markAsSeen(notificationInvitation.id)
    ).rejects.toThrow(/not authorized/)
  })
})
