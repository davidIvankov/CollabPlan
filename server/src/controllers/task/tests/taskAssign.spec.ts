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
import taskRouter from '..'

const createCaller = createCallerFactory(taskRouter)
const db = await wrapInRollbacks(createTestDatabase())

// a general setup for the tests
await clearTables(db, [TABLES.TASK])
const [user, userTwo] = await insertAll(db, TABLES.USER, [
  fakeUser(),
  fakeUser({ email: 'emai@gmail.com' }),
])
const [project] = await insertAll(
  db,
  TABLES.PROJECT,
  fakeProject({ createdBy: user.id })
)

vi.mock('@server/services/mailer', () => ({
  emailService: {
    sendActivityNotificationEmail: vi.fn(() => Promise.resolve()),
  },
}))

const task = fakeInsertableTask({ projectId: project.id })
const [taskOne] = await insertAll(db, TABLES.TASK, task)
await insertAll(db, TABLES.PROJECT_PARTICIPANT, [
  {
    projectId: project.id,
    userId: user.id,
    availability: JSON.stringify([
      {
        start: '2025-02-25T15:00:00Z',
        end: '2025-02-25T17:00:00Z',
      },
    ]),
  },
  {
    projectId: project.id,
    userId: userTwo.id,
    availability: JSON.stringify([
      {
        start: '2025-02-25T15:00:00Z',
        end: '2025-02-25T17:00:00Z',
      },
    ]),
  },
])

const { assign, unassign } = createCaller({ db, authUser: { id: user.id } })

describe('assign', async () => {
  it('assigns user to the task', async () => {
    const assignment = await assign({
      id: taskOne.id,
      scheduledTime: {
        start: '2025-02-25T15:00:00Z',
        end: '2025-02-25T17:00:00Z',
      },
    })

    expect(assignment).toMatchObject({
      assignedTo: user.id,
      scheduledTime: {
        start: '2025-02-25T15:00:00Z',
        end: '2025-02-25T17:00:00Z',
      },
    })
  })

  it('throws error if slot length does not match duration', async () => {
    await expect(
      assign({
        id: taskOne.id,
        scheduledTime: {
          start: '2025-02-25T15:00:00Z',
          end: '2025-02-25T16:00:00Z',
        },
      })
    ).rejects.toThrow(/Invalid slot duration/)
  })
})

describe('unassign', async () => {
  const assignedTask = fakeInsertableTask({
    projectId: project.id,
    assignedTo: user.id,
    scheduledTime: {
      start: '2025-02-25T15:00:00Z',
      end: '2025-02-25T16:00:00Z',
    },
  })
  const [taskAssigned] = await insertAll(db, TABLES.TASK, assignedTask)

  afterAll(async () => {
    await clearTables(db, [
      TABLES.PROJECT,
      TABLES.PROJECT_PARTICIPANT,
      TABLES.USER,
      TABLES.TASK,
    ])
  })

  it('unassign user if userId matches assigned to id', async () => {
    const unassignment = await unassign(taskAssigned.id)

    expect(unassignment).toMatchObject({
      assignedTo: null,
      scheduledTime: {},
    })
  })

  it('throws error if user is not assigned that task', async () => {
    await expect(
      createCaller({ db, authUser: { id: userTwo.id } }).unassign(
        taskAssigned.id
      )
    ).rejects.toThrow(/task is not assigned to you./)
  })
})
