import { INVITATION_STATUS } from '@server/database/dbConstants'
import { createUserParticipantSchema } from '@server/entities/projectParticipant'
import { invitationsRepository } from '@server/repositories/invitationsRepository'
import { projectParticipantRepository } from '@server/repositories/projectParticipantRepo'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { TRPCError } from '@trpc/server'

export default authenticatedProcedure
  .use(provideRepos({ projectParticipantRepository, invitationsRepository }))
  .input(createUserParticipantSchema)
  .mutation(async ({ input, ctx: { authUser, repos } }) => {
    const invitation = await repos.invitationsRepository.update(input)

    if (!invitation) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Invitation not found',
      })
    }

    if (invitation.status === INVITATION_STATUS.DECLINED) {
      return invitation
    }

    return repos.projectParticipantRepository.create({
      projectId: input.projectId,
      userId: authUser.id,
    })
  })
