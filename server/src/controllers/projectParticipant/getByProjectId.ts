import { idSchema } from '@server/entities/shared'
import { projectParticipantRepository } from '@server/repositories/projectParticipantRepo'
import { publicProcedure } from '@server/trpc'
import provideRepos from '@server/trpc/provideRepos'

export default publicProcedure
  .use(provideRepos({ projectParticipantRepository }))
  .input(idSchema)
  .mutation(async ({ input, ctx: { repos } }) =>
    repos.projectParticipantRepository.getByProjectId(input)
  )
