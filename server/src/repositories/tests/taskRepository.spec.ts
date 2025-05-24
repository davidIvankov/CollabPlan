import { createTestDatabase } from '@tests/utils/database'
import {
  fakeInsertableTask,
  fakeProject,
  fakeUser,
} from '@server/entities/tests/fakes'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { clearTables, insertAll, selectAll } from '@tests/utils/records'
import { TABLES, TASK_STATUS } from '../../database/dbConstants'
import { taskRepository } from '../taskRepository'

const db = await wrapInRollbacks(createTestDatabase())
const repository = taskRepository(db)
await clearTables(db, [TABLES.USER, TABLES.PROJECT])

const testVectorArray = Array.from({ length: 512 }, (_, i) => (i + 1) / 100)
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
const [taskOne] = await insertAll(db, TABLES.TASK, task)
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
    const { embedding, ...expectedResponse } = taskOne
    expect(selection).toEqual(expectedResponse)
  })
})

describe('assign', () => {
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

describe('setStatus', () => {
  it('sets status correctly', async () => {
    await repository.setDone({
      id: taskOne.id,
      actualDuration: 120,
      embedding: JSON.stringify(testVectorArray),
    })
    const tasks = await selectAll(db, TABLES.TASK)

    expect(tasks[0]).toMatchObject({
      id: taskOne.id,
      status: TASK_STATUS.DONE,
      actualDuration: 120,
    })
  })
})

describe('getByEmbedding', () => {
  it('returns top 5 tasks ordered by embedding similarity', async () => {
    const baseEmbedding = Array.from({ length: 512 }, (_, i) => (i + 1) / 100)
    const tasks = []
    for (let i = 0; i < 6; i += 1) {
      const emb = baseEmbedding.map((v) => v + i)
      const t = fakeInsertableTask({
        projectId: project.id,
        embedding: JSON.stringify(emb),
      })
      tasks.push(t)
    }
    await insertAll(db, TABLES.TASK, tasks)
    const results = await repository.getByEmbedding(
      JSON.stringify(baseEmbedding)
    )
    expect(Array.isArray(results)).toBe(true)
    expect(results.length).toBe(5)
  })
})
