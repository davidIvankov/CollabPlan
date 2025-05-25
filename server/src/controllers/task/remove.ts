import { isProject } from '@server/entities/project'
import { taskRemoveSchema } from '@server/entities/task'
import { notificationRepository } from '@server/repositories/notificationRepository'
import { projectParticipantRepository } from '@server/repositories/projectParticipantRepo'
import { projectRepository } from '@server/repositories/projectRepository'
import { taskRepository } from '@server/repositories/taskRepository'
import { userRepository } from '@server/repositories/userRepositorsitory'
import { emailService } from '@server/services/mailer'
import { notificationService } from '@server/services/notifications'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import { withBaseUrl } from '@server/trpc/middleware/withBaseUrl'
import provideRepos from '@server/trpc/provideRepos'
import { checkOwnership } from '@server/utils/authUtils'
import { TRPCError } from '@trpc/server'

export default authenticatedProcedure
  .use(withBaseUrl)
  .use(
    provideRepos({
      projectRepository,
      taskRepository,
      projectParticipantRepository,
      userRepository,
      notificationRepository,
    })
  )
  .input(taskRemoveSchema)
  .mutation(async ({ input, ctx: { authUser, repos, baseUrl } }) => {
    const project = await repos.projectRepository.getById(input.projectId)

    checkOwnership(project, authUser, 'remove tasks from')

    if (!isProject(project)) {
      throw new TRPCError({ message: 'not a project', code: 'PARSE_ERROR' })
    }

    const [userIds, userEmails] =
      await repos.projectParticipantRepository.getAllExceptUser(
        input.projectId,
        authUser.id
      )

    const lastSent =
      await repos.notificationRepository.getLastEmailedActivityNotificationDate(
        input.projectId
      )

    emailService.sendActivityNotificationEmail(
      userEmails,
      { projectName: project.name, baseUrl },
      lastSent
    )

    const userTriggered = await repos.userRepository.get(authUser.id)

    notificationService.deletedTask(
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

    return repos.taskRepository.remove(input.id)
  })
