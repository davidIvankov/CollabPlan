import { isProject } from '@server/entities/project'
import type { Slot } from '@server/entities/shared'
import { taskAssignSchema } from '@server/entities/task'
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
  .use(
    provideRepos({
      taskRepository,
      projectRepository,
      projectParticipantRepository,
      userRepository,
      notificationRepository,
    })
  )
  .use(withBaseUrl)
  .input(taskAssignSchema)
  .mutation(async ({ input, ctx: { authUser, repos, baseUrl } }) => {
    const taskDuration = (await repos.taskRepository.getById(input.id)).duration

    if (taskDuration !== getDurationInMinutes(input.scheduledTime)) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Invalid slot duration: expected ${taskDuration} minutes, but got different.`,
      })
    }
    const task = await repos.taskRepository.getById(input.id)
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

    notificationService.assignedTask(
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

    return repos.taskRepository.assign({
      ...input,
      userId: authUser.id,
    })
  })

function getDurationInMinutes(interval: Slot): number {
  const startDate = new Date(interval.start)
  const endDate = new Date(interval.end)

  return (endDate.getTime() - startDate.getTime()) / (1000 * 60)
}
