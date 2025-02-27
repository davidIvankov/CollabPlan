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
const { setAvailability, removeAvailability } = createCaller({
  db,
  authUser: { id: userTwo.id },
})

describe('setAvailability', () => {
  const available = {
    start: '2025-02-25T11:00:00Z',
    end: '2025-02-25T12:00:00Z',
  }

  it('sets availability if it passes authentication', async () => {
    const newAvailability = await setAvailability({
      projectId: project.id,
      availability: [available],
    })

    expect(newAvailability).toEqual({ availability: [available] })
  })

  it('merges overlapping timestamps', async () => {
    const availableOverlapping = {
      start: '2025-02-25T11:50:00Z',
      end: '2025-02-25T13:00:00Z',
    }
    await setAvailability({
      projectId: project.id,
      availability: [available],
    })

    const newAvailability = await setAvailability({
      projectId: project.id,
      availability: [availableOverlapping],
    })

    expect(newAvailability).toEqual({
      availability: [
        {
          start: '2025-02-25T11:00:00Z',
          end: '2025-02-25T13:00:00Z',
        },
      ],
    })
  })
  it('sorts them from earliest to the latest', async () => {
    await setAvailability({
      projectId: project.id,
      availability: [
        {
          start: '2025-02-25T15:00:00Z',
          end: '2025-02-25T16:00:00Z',
        },
      ],
    })
    await setAvailability({
      projectId: project.id,
      availability: [available],
    })

    const result = await setAvailability({
      projectId: project.id,
      availability: [
        {
          start: '2025-02-25T14:00:00Z',
          end: '2025-02-25T14:30:00Z',
        },
      ],
    })

    expect(result).toEqual({
      availability: [
        available,
        {
          start: '2025-02-25T14:00:00Z',
          end: '2025-02-25T14:30:00Z',
        },
        {
          start: '2025-02-25T15:00:00Z',
          end: '2025-02-25T16:00:00Z',
        },
      ],
    })
  })
})

describe('remove availability', () => {
  beforeAll(async () => {
    await clearTables(db, [TABLES.PROJECT_PARTICIPANT])

    await insertAll(db, TABLES.PROJECT_PARTICIPANT, {
      userId: userTwo.id,
      projectId: project.id,
      availability: JSON.stringify([
        {
          start: '2025-02-25T14:00:00Z',
          end: '2025-02-25T14:30:00Z',
        },
        {
          start: '2025-02-25T15:00:00Z',
          end: '2025-02-25T16:00:00Z',
        },
      ]),
    })
  })
  afterAll(async () => {
    await clearTables(db, [
      TABLES.PROJECT,
      TABLES.PROJECT_PARTICIPANT,
      TABLES.USER,
    ])
  })

  it('removes full time slot', async () => {
    const updated = await removeAvailability({
      projectId: project.id,
      scheduledTime: {
        start: '2025-02-25T14:00:00Z',
        end: '2025-02-25T14:30:00Z',
      },
    })

    expect(updated).toEqual({
      availability: [
        {
          start: '2025-02-25T15:00:00Z',
          end: '2025-02-25T16:00:00Z',
        },
      ],
    })
  })
})
