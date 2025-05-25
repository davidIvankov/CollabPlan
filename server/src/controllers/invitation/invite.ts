import { INVITATION_STATUS } from '@server/database/dbConstants'
import { invitationInputSchema } from '@server/entities/invitation'
import type { ProjectPublic } from '@server/entities/project'
import { invitationsRepository } from '@server/repositories/invitationsRepository'
import { projectRepository } from '@server/repositories/projectRepository'
import { userRepository } from '@server/repositories/userRepositorsitory'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { checkOwnership } from '@server/utils/authUtils'
import { emailService } from '@server/services/mailer'
import { notificationService } from '@server/services/notifications'
import { notificationRepository } from '@server/repositories/notificationRepository'
import { withBaseUrl } from '@server/trpc/middleware/withBaseUrl'

export default authenticatedProcedure
  .use(withBaseUrl)
  .use(
    provideRepos({
      projectRepository,
      invitationsRepository,
      userRepository,
      notificationRepository,
    })
  )
  .input(invitationInputSchema)
  .mutation(async ({ input, ctx: { authUser, repos, baseUrl } }) => {
    const { projectId, invitedUserId } = input
    const project: ProjectPublic = (await repos.projectRepository.getById(
      input.projectId
    )) as ProjectPublic

    checkOwnership(project, authUser, 'invite participant to')
    const { name: inviterName } = await repos.userRepository.get(authUser.id)

    const { email, name: recipientName } =
      await repos.userRepository.get(invitedUserId)
    const { name: projectName } = project

    emailService.sendInvitationEmail(email, {
      recipientName,
      projectName,
      inviterName,
      baseUrl,
    })

    await notificationService.invitation(
      { projectName, triggeredByName: authUser.id },
      repos.notificationRepository,
      { projectId, userId: invitedUserId, triggeredBy: authUser.id }
    )

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
