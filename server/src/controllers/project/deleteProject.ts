import { projectRepository } from '@server/repositories/projectRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { TRPCError } from '@trpc/server'
import { idSchema } from '@server/entities/shared'

export default authenticatedProcedure
  .use(provideRepos({ projectRepository }))
  .input(idSchema)
  .query(async ({ input: projectId, ctx: { repos, authUser } }) => {
    const project = await repos.projectRepository.getById(projectId)

    if (!project) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `Project not found: ${projectId}`,
      })
    }

    if (project.createdBy !== authUser.id) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message:
          'You are not authorized to delete this project because you are not the creator.',
      })
    }
    return repos.projectRepository.remove(projectId)
  })
