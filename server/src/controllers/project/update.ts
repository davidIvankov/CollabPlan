import { projectRepository } from '@server/repositories/projectRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { TRPCError } from '@trpc/server'
import { projectUpdateSchema } from '../../entities/project'

export default authenticatedProcedure
  .use(provideRepos({ projectRepository }))
  .input(projectUpdateSchema)
  .query(async ({ input, ctx: { repos, authUser } }) => {
    const project = await repos.projectRepository.getById(input.id)

    if (!project) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `Project not found: ${input}`,
      })
    }

    if (project.createdBy !== authUser.id) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message:
          'You are not authorized to update this project because you are not the creator.',
      })
    }
    return repos.projectRepository.update(input)
  })
