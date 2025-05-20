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

const [notificationInvitation, notificationProject] = await insertAll(
  db,
  TABLES.NOTIFICATION,
  [
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
  ]
)

const { getInvitationNotifications, getProjectNotifications } = createCaller({
  db,
  authUser: { id: userOne.id },
})

describe('getInvitationNotifications', () => {
  it('gets invitation notification list', async () => {
    const response = await getInvitationNotifications(1)

    expect(response).toEqual({ data: [notificationInvitation], hasMore: false })
  })
})

describe('getProjectNotifications', () => {
  it('gets project notification list', async () => {
    const response = await getProjectNotifications(1)

    expect(response).toEqual({ data: [notificationProject], hasMore: false })
  })
})
