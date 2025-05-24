import config from '@server/config'
import type {
  DocumentParams,
  TaskEmbedQueryParams,
  TaskPrompt,
  TaskPublic,
} from '@server/entities/task'
import { CohereClientV2 } from 'cohere-ai'
import { TRPCError } from '@trpc/server'
import type { ProjectPublic } from '@server/entities/project'

export const cohere = new CohereClientV2({
  token: config.cohere.apiKey,
})

export const getDocuments = (tasks: DocumentParams[]) =>
  tasks.map(
    ({
      id,
      name,
      projectName,
      description,
      projectDescription,
      estimatedDuration,
      actualDuration,
    }) => ({
      id,
      title: name,
      snippet: description ?? '',
      data: {
        description: description ?? 'No description provided.',
        projectName,
        projectDescription,
        estimatedDuration,
        actualDuration,
      },
    })
  )

export const createQueryEmbedding = async (
  task: TaskEmbedQueryParams,
  project: ProjectPublic
) => {
  const vector = await cohere.embed({
    texts: [
      `
        Task Name: ${task.name}
        Task Description: ${task.description}
        Project Name: ${project.name}
        Project Description: ${project.description}
      `.trim(),
    ],
    model: 'embed-v4.0',
    inputType: 'search_document',
    embeddingTypes: ['float'],
    outputDimension: 512,
  })
  const embedding = vector.embeddings.float
  if (!embedding)
    throw new TRPCError({
      message: 'embedding not generated',
      code: 'INTERNAL_SERVER_ERROR',
    })

  return JSON.stringify(embedding[0])
}

export const createEmbedding = async (
  task: TaskPublic,
  project: ProjectPublic
) => {
  const vector = await cohere.embed({
    texts: [
      `
        Task Name: ${task.name}
        Task Description: ${task.description}
        Estimated Duration: ${task.duration}
        Actual Duration: ${task.actualDuration}
        Project Name: ${project.name}
        Project Description: ${project.description}
      `.trim(),
    ],
    model: 'embed-v4.0',
    inputType: 'search_document',
    embeddingTypes: ['float'],
    outputDimension: 512,
  })
  const embedding = vector.embeddings.float
  if (!embedding)
    throw new TRPCError({
      message: 'embedding not generated',
      code: 'INTERNAL_SERVER_ERROR',
    })
  return JSON.stringify(embedding[0])
}

export const timeEstimatePrompt = ({
  projectName,
  taskName,
  description,
}: TaskPrompt) => {
  if (!projectName) {
    throw new TRPCError({
      message: 'project name missing',
      code: 'BAD_REQUEST',
    })
  }

  return `
You are an AI assistant that estimates how long a task will take.

  project name: ${projectName}
  task: ${taskName}
  ${description ? `description: ${description}` : ''}

Please provide an estimated time range in minutes Ex: 10 - 20 minutes.
The documents provided are previous tasks with known durations. Use them as examples to guide your estimate.
Even if no task in the documents is an exact match, use your reasoning and the examples to estimate the expected duration — don’t say ‘I don’t have info..
Respond with an estimated time range in minutes.
`
}
