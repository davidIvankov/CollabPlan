import { ROLE } from '@server/database/dbConstants'
import { taskReviewSchema } from '@server/entities/task'
import { projectParticipantRepository } from '@server/repositories/projectParticipantRepo'
import { taskRepository } from '@server/repositories/taskRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { TRPCError } from '@trpc/server'

export default authenticatedProcedure
  .use(provideRepos({ taskRepository, projectParticipantRepository }))
  .input(taskReviewSchema)
  .mutation(async ({ input, ctx: { authUser, repos } }) => {
    const { projectId, ...rest } = input
    const participant = await repos.projectParticipantRepository.get({
      projectId,
      userId: authUser.id,
    })

    if (participant.role === ROLE.MEMBER) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'only admin can review tasks',
      })
    }

    return repos.taskRepository.reviewTask(rest)
  })
