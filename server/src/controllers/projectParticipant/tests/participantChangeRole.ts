import {
  fakeProject,
  fakeProjectParticipant,
  fakeUser,
} from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { clearTables, insertAll, selectAll } from '@tests/utils/records'
import { TABLES } from '@server/database/dbConstants'
import projectParticipantRouter from '..'

const createCaller = createCallerFactory(projectParticipantRouter)
const db = await wrapInRollbacks(createTestDatabase())

// a general setup for the tests
await clearTables(db, [TABLES.PROJECT, TABLES.PROJECT_PARTICIPANT, TABLES.USER])
const [userOne, userTwo] = await insertAll(db, TABLES.USER, [
  fakeUser(),
  fakeUser({ email: 'fake@gmail.com' }),
])
const [project] = await insertAll(
  db,
  TABLES.PROJECT,
  fakeProject({ createdBy: userOne.id })
)

await insertAll(
  db,
  TABLES.PROJECT_PARTICIPANT,
  fakeProjectParticipant({ userId: userTwo.id, projectId: project.id })
)

const { changeRole } = createCaller({ db, authUser: { id: userOne.id } })

describe('changeRole', () => {
  afterAll(async () => {
    await clearTables(db, [
      TABLES.PROJECT,
      TABLES.PROJECT_PARTICIPANT,
      TABLES.USER,
    ])
  })

  it('changes role of the selected user if authUser is owner', async () => {
    await changeRole({
      role: 'admin',
      userId: userTwo.id,
      projectId: project.id,
    })
    const participants = await selectAll(db, TABLES.PROJECT_PARTICIPANT)

    expect(participants[0].role).toBe('admin')
  })

  it('throw error if authUser is not owner', async () => {
    const invalidCaller = createCaller({ db, authUser: { id: userTwo.id } })

    await expect(
      invalidCaller.changeRole({
        role: 'admin',
        userId: userTwo.id,
        projectId: project.id,
      })
    ).rejects.toThrow(/set roles in/)
  })
})
