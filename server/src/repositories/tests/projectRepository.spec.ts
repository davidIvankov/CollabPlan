import { createTestDatabase } from '@tests/utils/database'
import {
  projectMatcher,
  fakeProject,
  fakeUser,
} from '@server/entities/tests/fakes'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { clearTables, insertAll, selectAll } from '@tests/utils/records'
import { projectRepository } from '../projectRepository'
import { TABLES } from '../../database/dbConstants'

const db = await wrapInRollbacks(createTestDatabase())
const repository = projectRepository(db)

const [userOne, userTwo, userNoProjects] = await insertAll(db, 'user', [
  fakeUser(),
  fakeUser({ email: 'stipe@gmail.com' }),
  fakeUser({ email: 'jure@gmail.com' }),
])
const projectOne = fakeProject({ createdBy: userOne.id })
const projectTwo = fakeProject({ createdBy: userTwo.id })

describe('create', async () => {
  beforeAll(async () => {
    await clearTables(db, [TABLES.PROJECT])
  })

  afterEach(async () => {
    await clearTables(db, [TABLES.PROJECT])
  })

  it('creates project if all inputs are correct', async () => {
    const insertion = await repository.create(projectOne)

    expect(insertion).toEqual(projectMatcher(projectOne))
    expect(await selectAll(db, TABLES.PROJECT)).toEqual([
      projectMatcher(projectOne),
    ])
  })
})

describe('getById', () => {
  beforeAll(async () => {
    await insertAll(db, TABLES.PROJECT, [projectOne, projectTwo])
  })
  afterAll(async () => {
    await clearTables(db, [TABLES.PROJECT])
  })

  it('should return the correct project by ID', async () => {
    const projects = await selectAll(db, TABLES.PROJECT)
    const selection = await repository.getById(projects[0].id)

    expect(selection).toEqual(projectMatcher(projectOne))
  })
})

describe('getByCreatedBy', () => {
  beforeAll(async () => {
    await insertAll(db, TABLES.PROJECT, [projectOne, projectTwo])
  })
  afterAll(async () => {
    await clearTables(db, [TABLES.PROJECT])
  })

  it('should return the correct project by createdBy', async () => {
    const projects = await selectAll(db, TABLES.PROJECT)
    const selection = await repository.getByCreatedBy(projects[0].createdBy)

    expect(selection).toEqual([projectMatcher(projectOne)])
  })

  it('should return empty arrey if there is no projects from that user', async () => {
    const selection = await repository.getByCreatedBy(userNoProjects.id)

    expect(selection).toEqual([])
  })
})

describe('update', async () => {
  const NEW_NAME = 'new Name'
  beforeAll(async () => {
    await insertAll(db, TABLES.PROJECT, [projectOne, projectTwo])
  })

  afterAll(async () => {
    await clearTables(db, [TABLES.PROJECT, TABLES.USER])
  })

  it('should successfully update the project', async () => {
    const oldProjects = await selectAll(db, TABLES.PROJECT)
    const oldName = oldProjects[0].name

    await repository.update({ id: oldProjects[0].id, name: NEW_NAME })
    const newProjects = await selectAll(db, TABLES.PROJECT)
    const newName = newProjects[1].name

    expect(oldName).not.toBe(newName)
    expect(newName).toBe(NEW_NAME)
  })

  it('should return the updated project after a successful update', async () => {
    const oldProjects = await selectAll(db, TABLES.PROJECT)

    const updatedProject = await repository.update({
      id: oldProjects[1].id,
      name: NEW_NAME,
    })

    expect(updatedProject).toEqual(
      projectMatcher({ ...oldProjects[1], name: NEW_NAME })
    )
  })
})
