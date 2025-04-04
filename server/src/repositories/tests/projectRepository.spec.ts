import { createTestDatabase } from '@tests/utils/database'
import {
  projectMatcher,
  fakeProject,
  fakeUser,
  fakeProjectParticipant,
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

describe('getByParticipantId', () => {
  afterAll(async () => {
    await clearTables(db, [TABLES.PROJECT])
  })

  it('should return the correct project by participantId', async () => {
    const project = await insertAll(db, TABLES.PROJECT, [
      projectOne,
      projectTwo,
    ])
    await insertAll(db, TABLES.PROJECT_PARTICIPANT, [
      { userId: userNoProjects.id, projectId: project[0].id },
    ])
    const selection = await repository.getByParticipantId(userNoProjects.id)

    expect(selection).toEqual([
      { id: project[0].id, name: project[0].name, role: 'member' },
    ])
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
  const NEW_DESCRIPTION = 'new Description of the Project.'
  beforeAll(async () => {
    await insertAll(db, TABLES.PROJECT, [projectOne, projectTwo])
  })

  afterAll(async () => {
    await clearTables(db, [TABLES.PROJECT])
  })

  it('should successfully update the project', async () => {
    const oldProjects = await selectAll(db, TABLES.PROJECT)
    const oldName = oldProjects[0].name

    await repository.update({
      id: oldProjects[0].id,
      name: NEW_NAME,
      description: NEW_DESCRIPTION,
    })
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
      description: NEW_DESCRIPTION,
    })

    expect(updatedProject).toEqual(
      projectMatcher({
        ...oldProjects[1],
        name: NEW_NAME,
        description: NEW_DESCRIPTION,
      })
    )
  })
})

describe('Project Repository - Delete', async () => {
  beforeAll(async () => {
    await insertAll(db, TABLES.PROJECT, [projectOne, projectTwo])
  })

  afterAll(async () => {
    await clearTables(db, [
      TABLES.PROJECT,
      TABLES.USER,
      TABLES.PROJECT_PARTICIPANT,
    ])
  })

  it('should delete a project by ID successfully', async () => {
    const projects = await selectAll(db, TABLES.PROJECT)

    const removedProject = await repository.remove(projects[0].id)
    const projectsAfterDeletion = await selectAll(db, TABLES.PROJECT)

    expect(removedProject).toEqual(projects[0])
    expect(projectsAfterDeletion).toHaveLength(1)
  })

  it('should delete all the connected rows in other tables', async () => {
    const [project] = await selectAll(db, TABLES.PROJECT)
    await insertAll(
      db,
      TABLES.PROJECT_PARTICIPANT,
      fakeProjectParticipant({ userId: userOne.id, projectId: project.id })
    )

    await repository.remove(project.id)
    const projectParticipants = await selectAll(db, TABLES.PROJECT_PARTICIPANT)

    expect(projectParticipants).toHaveLength(0)
  })
})
