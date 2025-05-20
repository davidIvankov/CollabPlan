import { createTestDatabase } from '@tests/utils/database'
import {
  fakeProject,
  fakeUser,
  projectParticipantMatcher,
} from '@server/entities/tests/fakes'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { clearTables, insertAll, selectAll } from '@tests/utils/records'
import { TABLES } from '../../database/dbConstants'
import { projectParticipantRepository } from '../projectParticipantRepo'

const db = await wrapInRollbacks(createTestDatabase())
const repository = projectParticipantRepository(db)

const [userOne, userTwo] = await insertAll(db, 'user', [
  fakeUser(),
  fakeUser({ email: 'stipe@gmail.com' }),
])
const [project] = await insertAll(
  db,
  TABLES.PROJECT,
  fakeProject({ createdBy: userOne.id })
)
const projectParticipant = { projectId: project.id, userId: userTwo.id }
const projectParticipantTwo = { projectId: project.id, userId: userOne.id }

describe('create', async () => {
  beforeAll(async () => {
    await clearTables(db, [TABLES.PROJECT_PARTICIPANT])
  })

  it('creates participant when input is valid', async () => {
    const insertion = await repository.create(projectParticipant)
    const table = await selectAll(db, TABLES.PROJECT_PARTICIPANT)

    expect(insertion).toEqual(projectParticipantMatcher(projectParticipant))
    expect(table).toEqual([projectParticipantMatcher(projectParticipant)])
  })

  it('can not insert same user twice', async () => {
    await repository.create(projectParticipant)
    await expect(repository.create(projectParticipant)).rejects.toThrow(
      /duplicate/
    )
  })
})

describe('getAllExceptUser', () => {
  beforeAll(async () => {
    await insertAll(db, TABLES.PROJECT_PARTICIPANT, [
      projectParticipant,
      projectParticipantTwo,
    ])
  })
  it('returns participants from one project excluding one with the provided id', async () => {
    const participants = await repository.getAllExceptUser(
      project.id,
      userOne.id
    )

    expect(participants).toEqual([[userTwo.id], [userTwo.email]])
  })
})

describe('get', () => {
  it('returns participant when projectId and userId provided', async () => {
    const participant = await repository.get(projectParticipant)

    expect(participant).toEqual(projectParticipantMatcher(projectParticipant))
  })
})

describe('remove', () => {
  afterAll(async () => {
    await clearTables(db, [TABLES.PROJECT_PARTICIPANT])
  })
  it('removes participant', async () => {
    await repository.remove({ userId: userOne.id, projectId: project.id })
    const participants = await selectAll(db, TABLES.PROJECT_PARTICIPANT)

    expect(participants).toHaveLength(1)
  })
})
describe('setAvailability', () => {
  beforeAll(async () => {
    await insertAll(db, TABLES.PROJECT_PARTICIPANT, [
      projectParticipant,
      projectParticipantTwo,
    ])
  })

  it('sets availability correctly', async () => {
    const participants = await selectAll(db, TABLES.PROJECT_PARTICIPANT)
    const oldAvailability = participants[1].availability
    const slot = { start: '2025-02-25T11:00:00Z', end: '2025-02-25T12:00:00Z' }

    await repository.setAvailability({
      projectId: project.id,
      userId: userTwo.id,
      availability: slot,
    })
    const participantsUpdated = await selectAll(db, TABLES.PROJECT_PARTICIPANT)
    const newAvailability = participantsUpdated[1].availability

    expect(oldAvailability).not.toEqual(newAvailability)
    expect(newAvailability).toEqual([
      {
        start: '2025-02-25T11:00:00Z',
        end: '2025-02-25T12:00:00Z',
      },
    ])
  })

  it('sorts availability from earliest to latest', async () => {
    const slotEarly = {
      start: '2025-02-25T11:00:00Z',
      end: '2025-02-25T12:00:00Z',
    }

    const slotLate = {
      start: '2025-02-25T14:00:00Z',
      end: '2025-02-25T14:30:00Z',
    }

    await repository.setAvailability({
      projectId: project.id,
      userId: userTwo.id,
      availability: slotEarly,
    })

    await repository.setAvailability({
      projectId: project.id,
      userId: userTwo.id,
      availability: slotLate,
    })

    const participantsUpdated = await selectAll(db, TABLES.PROJECT_PARTICIPANT)
    const newAvailability = participantsUpdated[1].availability

    expect(newAvailability).toEqual([slotEarly, slotLate])
  })
})

describe('changeRole', () => {
  afterAll(async () => {
    await clearTables(db, [TABLES.PROJECT_PARTICIPANT])
  })
  const argumanet = { userId: userTwo.id, role: 'admin', projectId: project.id }
  it('changes role of the participant', async () => {
    await repository.changeRole(argumanet)
    const participants = await selectAll(db, TABLES.PROJECT_PARTICIPANT)

    expect(participants[1].role).toBe('admin')
  })
})
describe('removeAvailability', () => {
  beforeAll(async () => {
    await insertAll(db, TABLES.PROJECT_PARTICIPANT, [
      {
        ...projectParticipant,
        availability: JSON.stringify([
          { start: '2025-02-25T11:00:00Z', end: '2025-02-25T13:00:00Z' },
        ]),
      },
    ])
  })

  afterAll(async () => {
    await clearTables(db, [TABLES.PROJECT_PARTICIPANT])
  })

  it('removes availability correctly', async () => {
    const participants = await selectAll(db, TABLES.PROJECT_PARTICIPANT)
    const oldAvailability = participants[0].availability
    const slot = { start: '2025-02-25T11:30:00Z', end: '2025-02-25T12:00:00Z' }

    await repository.removeAvailability({
      projectId: project.id,
      userId: userTwo.id,
      scheduledTime: slot,
    })
    const participantsUpdated = await selectAll(db, TABLES.PROJECT_PARTICIPANT)
    const newAvailability = participantsUpdated[0].availability

    expect(oldAvailability).not.toEqual(newAvailability)
    expect(newAvailability).toEqual([
      { start: '2025-02-25T11:00:00Z', end: '2025-02-25T11:30:00Z' },
      { start: '2025-02-25T12:00:00Z', end: '2025-02-25T13:00:00Z' },
    ])
  })

  it('removes full interval interval if they match', async () => {
    const participants = await selectAll(db, TABLES.PROJECT_PARTICIPANT)
    const oldAvailability = participants[0].availability
    const slot = { start: '2025-02-25T11:00:00Z', end: '2025-02-25T13:00:00Z' }

    await repository.removeAvailability({
      projectId: project.id,
      userId: userTwo.id,
      scheduledTime: slot,
    })
    const participantsUpdated = await selectAll(db, TABLES.PROJECT_PARTICIPANT)
    const newAvailability = participantsUpdated[0].availability

    expect(oldAvailability).not.toEqual(newAvailability)
    expect(newAvailability).toEqual([])
  })
})
