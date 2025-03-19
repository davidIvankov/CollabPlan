import { removeAvailabilitySchema } from '@server/entities/projectParticipant'
import { projectParticipantRepository } from '@server/repositories/projectParticipantRepo'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { TRPCError } from '@trpc/server'

export default authenticatedProcedure
  .use(provideRepos({ projectParticipantRepository }))
  .input(removeAvailabilitySchema)
  .mutation(async ({ input, ctx: { authUser, repos } }) => {
    const row = await repos.projectParticipantRepository.get({
      projectId: input.projectId,
      userId: authUser.id,
    })

    if (!row) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to update availability.',
      })
    }

    return repos.projectParticipantRepository.removeAvailability({
      ...input,
      userId: authUser.id,
    })
  })
