import { createCallerFactory } from '@server/trpc'
import { TABLES } from '@server/database/dbConstants'
import { fakeProject, fakeUser } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { clearTables, insertAll, selectAll } from '@tests/utils/records'
import { wrapInRollbacks } from '@tests/utils/transactions'
import projectRouter from '..'

const createCaller = createCallerFactory(projectRouter)
const db = await wrapInRollbacks(createTestDatabase())

vi.mock('@server/services/mailer', () => ({
  emailService: {
    sendActivityNotificationEmail: vi.fn(() => Promise.resolve()),
  },
}))

// a general setup for the tests
await clearTables(db, [TABLES.PROJECT])
const [userOne, userTwo] = await insertAll(db, TABLES.USER, [
  fakeUser(),
  fakeUser({ email: 'staford@gmail.com' }),
])
await insertAll(db, TABLES.PROJECT, [
  fakeProject({ createdBy: userOne.id }),
  fakeProject({ createdBy: userTwo.id }),
])

const { deleteProject } = createCaller({ db, authUser: { id: userOne.id } })

describe('Project Controller - Delete', () => {
  afterAll(async () => {
    await clearTables(db, [TABLES.USER, TABLES.PROJECT])
  })
  it('should delete a project successfully when the creator deletes it', async () => {
    const projects = await selectAll(db, TABLES.PROJECT)

    const deletion = await deleteProject(projects[0].id)

    expect(deletion).toEqual(projects[0])
  })

  it('should return NOT_FOUND if the project does not exist', async () => {
    await expect(
      deleteProject('9e1f9d2e-44d1-4be4-8c89-5a2b418ac290')
    ).rejects.toThrow(/not found/)
  })

  it('should return FORBIDDEN if a non-creator tries to delete the project', async () => {
    const projects = await selectAll(db, TABLES.PROJECT)

    await expect(deleteProject(projects[1].id)).rejects.toThrow(
      /not authorized/
    )
  })
})
