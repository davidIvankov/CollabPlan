import { isProject } from '@server/entities/project'
import { setDoneSchema } from '@server/entities/task'
import { notificationRepository } from '@server/repositories/notificationRepository'
import { projectParticipantRepository } from '@server/repositories/projectParticipantRepo'
import { projectRepository } from '@server/repositories/projectRepository'
import { taskRepository } from '@server/repositories/taskRepository'
import { userRepository } from '@server/repositories/userRepositorsitory'
import { emailService } from '@server/services/mailer'
import { notificationService } from '@server/services/notifications'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { createEmbedding } from '@server/utils/cohere'
import { TRPCError } from '@trpc/server'

export default authenticatedProcedure
  .use(
    provideRepos({
      taskRepository,
      notificationRepository,
      projectRepository,
      projectParticipantRepository,
      userRepository,
    })
  )
  .input(setDoneSchema)
  .mutation(async ({ input, ctx: { authUser, repos } }) => {
    const task = await repos.taskRepository.getById(input.id)

    if (task.assignedTo !== authUser.id) {
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
      { projectName: project.name },
      lastSent
    )
    const userTriggered = await repos.userRepository.get(authUser.id)

    notificationService.completedTask(
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

    const embedding = await createEmbedding(task, project)

    return repos.taskRepository.setDone({ embedding, ...input })
  })
