import type { Slot } from '@server/entities/shared'
import { taskAssignSchema } from '@server/entities/task'
import { projectParticipantRepository } from '@server/repositories/projectParticipantRepo'
import { taskRepository } from '@server/repositories/taskRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { TRPCError } from '@trpc/server'

export default authenticatedProcedure
  .use(provideRepos({ projectParticipantRepository, taskRepository }))
  .input(taskAssignSchema)
  .mutation(async ({ input, ctx: { authUser, repos } }) => {
    await repos.projectParticipantRepository.removeAvailability({
      ...input,
      userId: authUser.id,
    })
    const taskDuration = (await repos.taskRepository.getById(input.id)).duration

    if (taskDuration !== getDurationInMinutes(input.scheduledTime)) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Invalid slot duration: expected ${taskDuration} minutes, but got different.`,
      })
    }

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
