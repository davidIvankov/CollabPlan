import { INVITATION_STATUS } from '@server/database/dbConstants'
import type { ProjectPublic } from '@server/entities/project'
import { createUserParticipantSchema } from '@server/entities/projectParticipant'
import { invitationsRepository } from '@server/repositories/invitationsRepository'
import { notificationRepository } from '@server/repositories/notificationRepository'
import { projectParticipantRepository } from '@server/repositories/projectParticipantRepo'
import { projectRepository } from '@server/repositories/projectRepository'
import { userRepository } from '@server/repositories/userRepositorsitory'
import { notificationService } from '@server/services/notifications'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { TRPCError } from '@trpc/server'

export default authenticatedProcedure
  .use(
    provideRepos({
      projectParticipantRepository,
      invitationsRepository,
      notificationRepository,
      projectRepository,
      userRepository,
    })
  )
  .input(createUserParticipantSchema)
  .mutation(async ({ input, ctx: { authUser, repos } }) => {
    const { projectId } = input
    const project: ProjectPublic = (await repos.projectRepository.getById(
      projectId
    )) as ProjectPublic

    const { name: projectName } = project

    const invitation = await repos.invitationsRepository.update(input)

    if (!invitation) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Invitation not found',
      })
    }

    const { name: triggeredByName } = await repos.userRepository.get(
      authUser.id
    )

    const [userIds] = await repos.projectParticipantRepository.getAllExceptUser(
      projectId,
      authUser.id
    )

    await repos.notificationRepository.remove({
      projectId: invitation.projectId,
      invitedById: invitation.invitedById,
      invitedUserId: authUser.id,
    })

    await notificationService.joinedProject(
      { projectName, triggeredByName },
      repos.notificationRepository,
      userIds,
      { projectId, triggeredBy: authUser.id }
    )

    if (invitation.status === INVITATION_STATUS.DECLINED) {
      return invitation
    }

    return repos.projectParticipantRepository.create({
      projectId: input.projectId,
      userId: authUser.id,
    })
  })
