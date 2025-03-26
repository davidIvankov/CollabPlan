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
const [user] = await insertAll(db, TABLES.USER, [fakeUser()])
const [project] = await insertAll(
  db,
  TABLES.PROJECT,
  fakeProject({ createdBy: user.id })
)

const task = fakeInsertableTask({ projectId: project.id })
const [taskOne] = await insertAll(db, TABLES.TASK, task)

const { get } = createCaller({ db, authUser: { id: user.id } })

describe('create', async () => {
  afterAll(async () => {
    await clearTables(db, [
      TABLES.PROJECT,
      TABLES.PROJECT_PARTICIPANT,
      TABLES.USER,
      TABLES.TASK,
    ])
  })

  it('assigns user to the task if he has slots', async () => {
    const response = await get(project.id)

    expect(response).toEqual([taskOne])
  })
})
