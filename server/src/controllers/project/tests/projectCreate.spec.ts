import {
  fakeProject,
  fakeUser,
  projectMatcher,
  projectParticipantMatcher,
} from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { clearTables, insertAll, selectAll } from '@tests/utils/records'
import { TABLES } from '@server/database/dbConstants'
import projectRouter from '..'

const createCaller = createCallerFactory(projectRouter)
const db = await wrapInRollbacks(createTestDatabase())

// a general setup for the tests
await clearTables(db, [TABLES.PROJECT])
const [user] = await insertAll(db, TABLES.USER, fakeUser())
const { id } = user

const { create } = createCaller({ db, authUser: { id } })

describe('create', () => {
  afterEach(async () => {
    await clearTables(db, [TABLES.PROJECT])
  })
  afterAll(async () => {
    await clearTables(db, [TABLES.USER])
  })

  it('creates project if input is valid', async () => {
    const project = fakeProject({ createdBy: id })

    const insertion = await create(project)

    const projects = await selectAll(db, TABLES.PROJECT)

    expect(insertion).toEqual(projectMatcher(project))
    expect(projects).toEqual([insertion])
  })

  it('adds creator as admin automatically', async () => {
    const project = await create(fakeProject({ createdBy: id }))
    const projectId = project.id
    const [participant] = await selectAll(db, TABLES.PROJECT_PARTICIPANT)

    expect(participant).toEqual(
      projectParticipantMatcher({ projectId, userId: id, role: 'admin' })
    )
  })
})
