import {
  fakeInsertableTask,
  fakeProject,
  fakeUser,
} from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
import { TABLES } from '@server/database/dbConstants'
import * as cohereUtils from '@server/utils/cohere'
import { cohere } from '@server/utils/cohere'
import timeEstimationRouter from '..'

const createCaller = createCallerFactory(timeEstimationRouter)
const db = await wrapInRollbacks(createTestDatabase())

const [user] = await insertAll(db, TABLES.USER, [fakeUser()])
const [project] = await insertAll(
  db,
  TABLES.PROJECT,
  fakeProject({ createdBy: user.id })
)

const task = fakeInsertableTask({ projectId: project.id })
await insertAll(db, TABLES.TASK, [task, task])

const { get } = createCaller({ db })

vi.mock('@server/utils/cohere', async () => {
  const actual = await vi.importActual<typeof cohereUtils>(
    '@server/utils/cohere'
  )
  const testVectorArray = Array.from({ length: 512 }, (_, i) => (i + 1) / 100)
  return {
    ...actual,
    createEmbedding: vi.fn().mockResolvedValue(testVectorArray),
    getDocuments: vi.fn().mockReturnValue([]),
    cohere: {
      chat: vi.fn().mockResolvedValue({
        text: 'Estimated time: 30-60 minutes',
        generationId: 'mock-gen-id',
      }),
    },
  }
})

describe('timeEstimation', async () => {
  it('prompt is sent to the ai correctly', async () => {
    const response = await get({
      name: task.name,
      projectId: project.id,
      description: task.description ?? undefined,
      messages: [],
    })

    expect(cohere.chat).toHaveBeenCalledWith({
      model: 'command-a-03-2025',
      documents: expect.any(Array),
      messages: [
        {
          role: 'system',
          content: expect.stringContaining(
            'You are an AI assistant that estimates how long a task will take.'
          ),
        },
        {
          role: 'user',
          content: 'Estimate the time for this task.',
        },
      ],
    })

    expect(response).toEqual({
      text: 'Estimated time: 30-60 minutes',
      generationId: 'mock-gen-id',
    })
  })

  it('appends user messages to the prompt', async () => {
    const inputMessages = [
      {
        role: 'system',
        content: expect.stringContaining(
          'You are an AI assistant that estimates how long a task will take.'
        ),
      },
      {
        role: 'user',
        content: 'Estimate the time for this task.',
      },
      {
        role: 'user',
        content: 'How about 45 minutes?',
      },
    ]
    const responseWithMsg = await get({
      name: task.name,
      projectId: project.id,
      description: task.description ?? undefined,
      messages: [{ role: 'user', content: 'How about 45 minutes?' }],
    })
    expect(cohere.chat).toHaveBeenCalledWith({
      model: 'command-a-03-2025',
      documents: expect.any(Array),
      messages: inputMessages,
    })
    expect(responseWithMsg).toEqual({
      text: 'Estimated time: 30-60 minutes',
      generationId: 'mock-gen-id',
    })
  })
})
