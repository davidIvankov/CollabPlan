import { TRPCError } from '@trpc/server'
import { timeEstimatePrompt, getDocuments } from '../cohere'

describe('timeEstimatePrompt', () => {
  it('returns a prompt string with all fields', () => {
    const prompt = timeEstimatePrompt({
      projectName: 'Test Project',
      taskName: 'Test Task',
      description: 'A test task description',
    })
    expect(prompt).toContain(
      'You are an AI assistant that estimates how long a task will take.'
    )
    expect(prompt).toContain('project name: Test Project')
    expect(prompt).toContain('task: Test Task')
    expect(prompt).toContain('description: A test task description')
  })

  it('throws if projectName is missing', () => {
    expect(() =>
      timeEstimatePrompt({
        projectName: '',
        taskName: 'Test Task',
        description: 'desc',
      })
    ).toThrow(TRPCError)
  })

  it('handles empty documents', () => {
    const prompt = timeEstimatePrompt({
      projectName: 'P',
      taskName: 'T',
      description: '',
    })
    expect(prompt).toContain(
      'You are an AI assistant that estimates how long a task will take.'
    )
  })
})

describe('getDocuments', () => {
  it('returns mapped documents with correct shape', () => {
    const tasks = [
      {
        id: 'id1',
        name: 'Task 1',
        projectName: 'Project 1',
        description: 'desc1',
        projectDescription: 'projdesc1',
        estimatedDuration: 10,
        actualDuration: 5,
      },
      {
        id: 'id2',
        name: 'Task 2',
        projectName: 'Project 2',
        description: null, // explicitly set to null to match type
        projectDescription: null,
        estimatedDuration: 20,
        actualDuration: null,
      },
    ]
    const docs = getDocuments(tasks)
    expect(docs).toHaveLength(2)
    expect(docs[0]).toEqual({
      id: 'id1',
      title: 'Task 1',
      snippet: 'desc1',
      data: expect.objectContaining({
        projectName: 'Project 1',
        projectDescription: 'projdesc1',
        estimatedDuration: 10,
        description: 'desc1',
        actualDuration: 5,
      }),
    })
    expect(docs[1]).toEqual({
      id: 'id2',
      title: 'Task 2',
      snippet: '',
      data: expect.objectContaining({
        description: 'No description provided.',
        projectName: 'Project 2',
        projectDescription: null,
        estimatedDuration: 20,
        actualDuration: null,
      }),
    })
  })
})
