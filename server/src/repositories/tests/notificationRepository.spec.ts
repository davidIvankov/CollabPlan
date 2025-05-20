import { createTestDatabase } from '@tests/utils/database'
import { fakeProject, fakeUser } from '@server/entities/tests/fakes'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { clearTables, insertAll } from '@tests/utils/records'
import { NOTIFICATION_TYPE, TABLES } from '../../database/dbConstants'
import { notificationRepository } from '../notificationRepository'

const db = await wrapInRollbacks(createTestDatabase())
const repository = notificationRepository(db)

await clearTables(db, [TABLES.USER, TABLES.PROJECT])
const [userOne, userTwo] = await insertAll(db, 'user', [
  fakeUser(),
  fakeUser({ email: 'stipe@gmail.com' }),
])
const [project, projectTwo] = await insertAll(db, TABLES.PROJECT, [
  fakeProject({ createdBy: userOne.id }),
  fakeProject({ createdBy: userTwo.id }),
])

const [notificationLatest] = await insertAll(db, TABLES.NOTIFICATION, [
  {
    message: 'hello',
    type: NOTIFICATION_TYPE.PROJECT_UPDATE,
    emailed: true,
    projectId: project.id,
    userId: userOne.id,
    triggeredBy: userTwo.id,
    createdAt: new Date('2025-05-17T12:00:00.000Z'),
  },
  {
    message: 'hello',
    type: NOTIFICATION_TYPE.PROJECT_UPDATE,
    emailed: true,
    projectId: project.id,
    userId: userOne.id,
    triggeredBy: userTwo.id,
    createdAt: new Date('2025-05-17T12:00:00.000Z'),
  },
  {
    message: 'hello',
    type: NOTIFICATION_TYPE.PROJECT_UPDATE,
    emailed: false,
    projectId: project.id,
    userId: userOne.id,
    triggeredBy: userTwo.id,
    createdAt: new Date('2025-05-17T12:00:00.000Z'),
  },
])

describe('getLastEmailedActivityNotificationDate', () => {
  it('get date from the latest emailed notification', async () => {
    const response = await repository.getLastEmailedActivityNotificationDate(
      project.id
    )

    expect(response).toEqual(notificationLatest.createdAt)
  })

  it('get undefined when there is no emailed notifications', async () => {
    const response = await repository.getLastEmailedActivityNotificationDate(
      projectTwo.id
    )

    expect(response).toBeFalsy()
  })
})

describe('remove', () => {
  it('removes notification if authorized', async () => {
    const deletion = await repository.remove({
      projectId: project.id,
      invitedById: userTwo.id,
      invitedUserId: userOne.id,
    })
    expect(deletion).toEqual(notificationLatest)
  })
  it('does not delete if not authorized', async () => {
    expect(
      await repository.remove({
        projectId: project.id,
        invitedById: userOne.id,
        invitedUserId: userOne.id,
      })
    ).toBeFalsy()
  })
})
