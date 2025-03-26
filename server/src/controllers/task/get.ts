import { idSchema } from '@server/entities/shared'
import { taskRepository } from '@server/repositories/taskRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'

export default authenticatedProcedure
  .use(provideRepos({ taskRepository }))
  .input(idSchema)
  .query(async ({ input, ctx: { repos } }) =>
    repos.taskRepository.getByProjectId(input)
  )
