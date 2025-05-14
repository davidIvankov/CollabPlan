import { projectRepository } from '@server/repositories/projectRepository'
import { userRepository } from '@server/repositories/userRepositorsitory'
import { publicProcedure } from '@server/trpc'
import { projectParticipantRepository } from '@server/repositories/projectParticipantRepo'
import { taskRepository } from '@server/repositories/taskRepository'
import provideRepos from '@server/trpc/provideRepos'
import { invitationsRepository } from '@server/repositories/invitationsRepository'

export default publicProcedure
  .use(
    provideRepos({
      taskRepository,
      userRepository,
      projectRepository,
      projectParticipantRepository,
      invitationsRepository,
    })
  )
  .mutation(async ({ ctx: { repos } }) => {
    await repos.taskRepository.deleteAll()
    await repos.projectParticipantRepository.deleteAll()
    await repos.invitationsRepository.deleteAll()
    await repos.projectRepository.deleteAll()
    await repos.userRepository.deleteAll()

    return { success: true }
  })
