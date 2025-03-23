import { idSchema } from '@server/entities/shared'
import { projectRepository } from '@server/repositories/projectRepository'
import { publicProcedure } from '@server/trpc'
import provideRepos from '@server/trpc/provideRepos'
import { TRPCError } from '@trpc/server'

export default publicProcedure
  .use(provideRepos({ projectRepository }))
  .input(idSchema)
  .query(async ({ input, ctx: { repos } }) => {
    const project = await repos.projectRepository.getByParticipantId(input)

    if (!project) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `Project not found: ${input}`,
      })
    }

    return project
  })
