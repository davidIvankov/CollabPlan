import { taskDurationEstimationSchema } from '@server/entities/task'
import { projectRepository } from '@server/repositories/projectRepository'
import { taskRepository } from '@server/repositories/taskRepository'
import provideRepos from '@server/trpc/provideRepos'
import { publicProcedure } from '@server/trpc'
import {
  cohere,
  createQueryEmbedding,
  getDocuments,
  timeEstimatePrompt,
} from '@server/utils/cohere'
import { TRPCError } from '@trpc/server'

export default publicProcedure
  .use(
    provideRepos({
      projectRepository,
      taskRepository,
    })
  )
  .input(taskDurationEstimationSchema)
  .query(async ({ input, ctx: { repos } }) => {
    const { projectId, name: taskName, description } = input
    const project = await repos.projectRepository.getById(projectId)

    if (!project) {
      throw new TRPCError({ message: 'No such project', code: 'NOT_FOUND' })
    }

    const queryEmbedding = await createQueryEmbedding(input, project)

    const documents = getDocuments(
      await repos.taskRepository.getByEmbedding(queryEmbedding)
    )

    return cohere.chat({
      model: 'command-a-03-2025',
      documents,
      messages: [
        {
          role: 'system',
          content: timeEstimatePrompt({
            taskName,
            description,
            projectName: project.name,
          }),
        },
        {
          role: 'user',
          content: 'Estimate the time for this task.',
        },
        ...input.messages,
      ],
    })
  })
