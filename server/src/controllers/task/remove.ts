import { taskRemoveSchema } from '@server/entities/task'
import { projectRepository } from '@server/repositories/projectRepository'
import { taskRepository } from '@server/repositories/taskRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { checkOwnership } from '@server/utils/authUtils'

export default authenticatedProcedure
  .use(provideRepos({ projectRepository, taskRepository }))
  .input(taskRemoveSchema)
  .mutation(async ({ input, ctx: { authUser, repos } }) => {
    const project = await repos.projectRepository.getById(input.projectId)

    checkOwnership(project, authUser, 'remove tasks from')

    return repos.taskRepository.remove(input.id)
  })
