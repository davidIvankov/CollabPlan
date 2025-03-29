import {
  fakeInsertableTask,
  fakeProject,
  fakeUser,
} from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { clearTables, insertAll } from '@tests/utils/records'
import { ROLE, TABLES, TASK_STATUS } from '@server/database/dbConstants'
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

const scheduladTime = {
  start: '2025-02-25T15:00:00Z',
  end: '2025-02-25T17:00:00Z',
}
const task = fakeInsertableTask({
  projectId: project.id,
  assignedTo: user.id,
  scheduledTime: JSON.stringify(scheduladTime),
})

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
    role: ROLE.ADMIN,
  },
])

const { setDone } = createCaller({
  db,
  authUser: { id: user.id },
})

describe('setReview', () => {
  it('sets task to review', async () => {
    const response = await setDone(taskOne.id)

    expect(response).toEqual({ id: taskOne.id, status: TASK_STATUS.DONE })
  })

  it('throws error if task not assigned to the user', async () => {
    const unauthorizedCaller = createCaller({
      db,
      authUser: { id: userTwo.id },
    })

    await expect(unauthorizedCaller.setDone(taskOne.id)).rejects.toThrow(
      /task is not assigned to you./
    )
  })
})
