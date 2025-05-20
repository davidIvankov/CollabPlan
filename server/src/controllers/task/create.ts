import { taskInsertableSchema } from '@server/entities/task'
import { projectParticipantRepository } from '@server/repositories/projectParticipantRepo'
import { projectRepository } from '@server/repositories/projectRepository'
import { taskRepository } from '@server/repositories/taskRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { checkOwnership } from '@server/utils/authUtils'
import { userRepository } from '@server/repositories/userRepositorsitory'
import { notificationRepository } from '@server/repositories/notificationRepository'
import { TRPCError } from '@trpc/server'
import { isProject } from '@server/entities/project'
import { emailService } from '@server/services/mailer'
import { notificationService } from '../../services/notifications/index'

export default authenticatedProcedure
  .use(
    provideRepos({
      projectRepository,
      taskRepository,
      projectParticipantRepository,
      userRepository,
      notificationRepository,
    })
  )
  .input(taskInsertableSchema)
  .mutation(async ({ input, ctx: { authUser, repos } }) => {
    const { projectId } = input
    const project = await repos.projectRepository.getById(projectId)
    checkOwnership(project, authUser, 'add task to')

    const userTriggered = await repos.userRepository.get(authUser.id)
    if (!isProject(project)) {
      throw new TRPCError({ message: 'not a project', code: 'PARSE_ERROR' })
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
      { projectName: project.name },
      lastSent
    )

    notificationService.createdTask(
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

    return repos.taskRepository.create(input)
  })
