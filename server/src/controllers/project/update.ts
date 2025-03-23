import { projectRepository } from '@server/repositories/projectRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { checkOwnership } from '@server/utils/authUtils'
import { projectUpdateSchema } from '../../entities/project'

export default authenticatedProcedure
  .use(provideRepos({ projectRepository }))
  .input(projectUpdateSchema)
  .mutation(async ({ input, ctx: { repos, authUser } }) => {
    const project = await repos.projectRepository.getById(input.id)
    checkOwnership(project, authUser, 'update')

    return repos.projectRepository.update(input)
  })
