import { INVITATION_STATUS } from '@server/database/dbConstants'
import { invitationInputSchema } from '@server/entities/invitation'
import { invitationsRepository } from '@server/repositories/invitationsRepository'
import { projectRepository } from '@server/repositories/projectRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { checkOwnership } from '@server/utils/authUtils'

export default authenticatedProcedure
  .use(provideRepos({ projectRepository, invitationsRepository }))
  .input(invitationInputSchema)
  .mutation(async ({ input, ctx: { authUser, repos } }) => {
    const { projectId, invitedUserId } = input
    const project = await repos.projectRepository.getById(input.projectId)

    checkOwnership(project, authUser, 'invite participant to')

    const invitation =
      await repos.invitationsRepository.getByUserAndProjectId(input)

    if (invitation) {
      const { id } = invitation
      return repos.invitationsRepository.update({
        id,
        projectId,
        status: INVITATION_STATUS.PENDING,
      })
    }

    return repos.invitationsRepository.create({
      invitedById: authUser.id,
      projectId,
      invitedUserId,
    })
  })
