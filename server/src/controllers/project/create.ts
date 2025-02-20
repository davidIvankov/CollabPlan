import { projectInsertableSchema } from '@server/entities/project'
import { projectRepository } from '@server/repositories/projectRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'

export default authenticatedProcedure
  .use(provideRepos({ projectRepository }))
  .input(projectInsertableSchema)
  .mutation(async ({ input, ctx: { authUser, repos } }) => {
    const projectCreated = await repos.projectRepository.create({
      ...input,
      createdBy: authUser.id,
    })
    return projectCreated
  })
