import { createCallerFactory } from '@server/trpc'
import { TABLES } from '@server/database/dbConstants'
import { fakeProject, fakeUser } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { clearTables, insertAll, selectAll } from '@tests/utils/records'
import { wrapInRollbacks } from '@tests/utils/transactions'
import projectRouter from '..'

const createCaller = createCallerFactory(projectRouter)
const db = await wrapInRollbacks(createTestDatabase())

// a general setup for the tests
await clearTables(db, [TABLES.PROJECT])
const [user] = await insertAll(db, TABLES.USER, fakeUser())
const { id } = user
await insertAll(db, TABLES.PROJECT, [
  fakeProject({ createdBy: user.id }),
  fakeProject({ createdBy: user.id }),
])

const { update } = createCaller({ db, authUser: { id } })
const [project] = await selectAll(db, TABLES.PROJECT)

describe('updateProject', () => {
  afterAll(async () => {
    await clearTables(db, [TABLES.PROJECT, TABLES.USER])
  })

  it('should update project details successfully', async () => {
    const updatedProject = await update({ name: 'new Name', id: project.id })

    expect(updatedProject?.name).toBe('new Name')
  })

  it('should throw an error if project does not exist', async () => {
    await expect(
      update({ name: 'new Name', id: '550e8400-e29b-41d4-a716-446655440000' })
    ).rejects.toThrow(/not found/)
  })

  it('should throw error if user is not authorized', async () => {
    await expect(
      createCaller({
        db,
        authUser: { id: '550e8400-e29b-41d4-a716-446655440000' },
      }).update({ name: 'new Name', id: project.id })
    ).rejects.toThrow(/not authorized/)
  })
})
