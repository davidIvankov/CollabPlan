import { projectRepository } from '@server/repositories/projectRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { TRPCError } from '@trpc/server'
import { idSchema } from '@server/entities/shared'
import { isProject } from '@server/entities/project'
import { notificationRepository } from '@server/repositories/notificationRepository'
import { projectParticipantRepository } from '@server/repositories/projectParticipantRepo'
import { userRepository } from '@server/repositories/userRepositorsitory'
import { notificationService } from '@server/services/notifications'
import { emailService } from '@server/services/mailer'
import { withBaseUrl } from '@server/trpc/middleware/withBaseUrl'

export default authenticatedProcedure
  .use(withBaseUrl)
  .use(
    provideRepos({
      projectRepository,
      projectParticipantRepository,
      userRepository,
      notificationRepository,
    })
  )
  .input(idSchema)
  .mutation(async ({ input: projectId, ctx: { repos, authUser, baseUrl } }) => {
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

    const [userIds, userEmails] =
      await repos.projectParticipantRepository.getAllExceptUser(
        projectId,
        authUser.id
      )

    const lastSent =
      await repos.notificationRepository.getLastEmailedActivityNotificationDate(
        projectId
      )

    emailService.sendActivityNotificationEmail(
      userEmails,
      { projectName: project.name, baseUrl },
      lastSent
    )

    const userTriggered = await repos.userRepository.get(authUser.id)
    if (!isProject(project)) {
      throw new TRPCError({ message: 'not a project', code: 'PARSE_ERROR' })
    }

    notificationService.deletedProject(
      {
        projectName: project.name,
        triggeredByName: userTriggered.name,
      },
      repos.notificationRepository,
      userIds,
      {
        projectId: project.id,
        triggeredBy: authUser.id,
      }
    )

    return repos.projectRepository.remove(projectId)
  })
