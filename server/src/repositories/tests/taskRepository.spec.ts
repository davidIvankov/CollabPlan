import { createTestDatabase } from '@tests/utils/database'
import {
  fakeInsertableTask,
  fakeProject,
  fakeUser,
} from '@server/entities/tests/fakes'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { clearTables, insertAll, selectAll } from '@tests/utils/records'
import { TABLES } from '../../database/dbConstants'
import { taskRepository } from '../taskRepository'

const db = await wrapInRollbacks(createTestDatabase())
const repository = taskRepository(db)

const [userOne] = await insertAll(db, 'user', [
  fakeUser(),
  fakeUser({ email: 'stipe@gmail.com' }),
])
const [project] = await insertAll(
  db,
  TABLES.PROJECT,
  fakeProject({ createdBy: userOne.id })
)

const task = fakeInsertableTask({ projectId: project.id })
const [taskOne] = await insertAll(
  db,
  TABLES.TASK,
  fakeInsertableTask({ projectId: project.id })
)
describe('create', () => {
  it('creates task', async () => {
    await repository.create(task)
    const selection = await selectAll(db, TABLES.TASK)

    expect(selection[1]).toMatchObject(task)
  })
})

describe('getById', () => {
  it('returns task by id', async () => {
    const selection = await repository.getById(taskOne.id)
    expect(selection).toEqual(taskOne)
  })
})

describe('assign', () => {
  afterAll(async () => {
    await clearTables(db, [
      TABLES.PROJECT,
      TABLES.PROJECT_PARTICIPANT,
      TABLES.USER,
      TABLES.TASK,
    ])
  })
  const assignmentData = {
    id: taskOne.id,
    scheduledTime: {
      start: '2025-02-25T11:00:00Z',
      end: '2025-02-25T13:00:00Z',
    },
    userId: userOne.id,
  }

  it('assigns project to the user and adds scheduledTime', async () => {
    const update = await repository.assign(assignmentData)
    const entries = await selectAll(db, TABLES.TASK)

    const { userId, ...rest } = assignmentData
    expect(update).toMatchObject({ assignedTo: userId, ...rest })
    expect(entries[0]).toMatchObject({ assignedTo: userId, ...rest })
  })
})
