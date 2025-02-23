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

describe('create', () => {
  afterAll(async () => {
    await clearTables(db, [
      TABLES.PROJECT,
      TABLES.PROJECT_PARTICIPANT,
      TABLES.USER,
      TABLES.TASK,
    ])
  })

  it('creates task', async () => {
    const task = fakeInsertableTask({ projectId: project.id })
    await repository.create(task)
    const selection = await selectAll(db, TABLES.TASK)

    expect(selection[0]).toMatchObject(task)
  })
})
