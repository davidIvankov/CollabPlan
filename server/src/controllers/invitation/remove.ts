import { invitationInputSchema } from '@server/entities/invitation'
import { invitationsRepository } from '@server/repositories/invitationsRepository'
import { notificationRepository } from '@server/repositories/notificationRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { TRPCError } from '@trpc/server'

export default authenticatedProcedure
  .use(provideRepos({ invitationsRepository, notificationRepository }))
  .input(invitationInputSchema)
  .mutation(async ({ input, ctx: { authUser, repos } }) => {
    const { projectId, invitedUserId } = input

    const deletion = await repos.invitationsRepository.delete({
      invitedById: authUser.id,
      projectId,
      invitedUserId,
    })
    const notificationRemoved = await repos.notificationRepository.remove({
      projectId,
      invitedById: authUser.id,
      invitedUserId,
    })

    if (!deletion || !notificationRemoved) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You are not authorized to remove this invitation.',
      })
    }

    return deletion
  })
