import { isProject } from '@server/entities/project'
import { idSchema } from '@server/entities/shared'
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
import { TRPCError } from '@trpc/server'

export default authenticatedProcedure
  .use(withBaseUrl)
  .use(
    provideRepos({
      taskRepository,
      projectRepository,
      projectParticipantRepository,
      userRepository,
      notificationRepository,
    })
  )
  .input(idSchema)
  .mutation(async ({ input, ctx: { authUser, repos, baseUrl } }) => {
    const task = await repos.taskRepository.getById(input)
    if (authUser.id !== task.assignedTo) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'task is not assigned to you.',
      })
    }

    const project = await repos.projectRepository.getById(task.projectId)

    if (!isProject(project)) {
      throw new TRPCError({ message: 'not a project', code: 'PARSE_ERROR' })
    }

    const [userIds, userEmails] =
      await repos.projectParticipantRepository.getAllExceptUser(
        task.projectId,
        authUser.id
      )

    const lastSent =
      await repos.notificationRepository.getLastEmailedActivityNotificationDate(
        task.projectId
      )

    emailService.sendActivityNotificationEmail(
      userEmails,
      { projectName: project.name, baseUrl },
      lastSent
    )

    const userTriggered = await repos.userRepository.get(authUser.id)

    notificationService.unassignedTask(
      {
        projectName: project.name,
        triggeredByName: userTriggered.name,
        taskName: task.name,
      },
      repos.notificationRepository,
      userIds,
      {
        projectId: project.id,
        triggeredBy: authUser.id,
      }
    )

    return repos.taskRepository.unassign(input)
  })
