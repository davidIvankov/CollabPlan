import {
  fakeInsertableTask,
  fakeProject,
  fakeUser,
} from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { clearTables, insertAll } from '@tests/utils/records'
import { TABLES } from '@server/database/dbConstants'
import { notificationService } from '@server/services/notifications/index'
import taskRouter from '..'

const createCaller = createCallerFactory(taskRouter)
const db = await wrapInRollbacks(createTestDatabase())

vi.mock('@server/services/mailer', () => ({
  emailService: {
    sendActivityNotificationEmail: vi.fn(() => Promise.resolve()),
  },
}))

vi.mock('@server/services/notifications', () => ({
  notificationService: {
    createdTask: vi.fn(),
  },
}))
// a general setup for the tests
await clearTables(db, [TABLES.TASK])
const [user, userTwo] = await insertAll(db, TABLES.USER, [
  fakeUser(),
  fakeUser({ email: 'emai@gmail.com' }),
])
const { id } = user
const [project] = await insertAll(
  db,
  TABLES.PROJECT,
  fakeProject({ createdBy: id })
)
await insertAll(db, TABLES.PROJECT_PARTICIPANT, {
  projectId: project.id,
  userId: userTwo.id,
})

const { create } = createCaller({ db, authUser: { id } })

describe('create', () => {
  afterAll(async () => {
    await clearTables(db, [
      TABLES.PROJECT,
      TABLES.PROJECT_PARTICIPANT,
      TABLES.USER,
      TABLES.TASK,
    ])
  })

  const task = fakeInsertableTask({ projectId: project.id })

  it('adds task when all fields are correct', async () => {
    const insertion = await create(task)

    expect(insertion).toMatchObject(task)
  })

  it('passes correct userIds to notification service', async () => {
    await create(fakeInsertableTask({ projectId: project.id }))

    const callArgs = (notificationService.createdTask as any).mock.calls[0]
    const userIds = callArgs[2]

    expect(userIds).toEqual([userTwo.id])
  })
  it('throws error when non authorized user tries to add task', async () => {
    const unauthorizedCaller = createCaller({
      db,
      authUser: { id: userTwo.id },
    })

    await expect(unauthorizedCaller.create(task)).rejects.toThrow(/task/)
  })
})
