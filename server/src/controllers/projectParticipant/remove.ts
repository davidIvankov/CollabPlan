import { projectParticipantInsertableSchema } from '@server/entities/projectParticipant'
import { projectParticipantRepository } from '@server/repositories/projectParticipantRepo'
import { projectRepository } from '@server/repositories/projectRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { checkOwnership } from '@server/utils/authUtils'

export default authenticatedProcedure
  .use(provideRepos({ projectParticipantRepository, projectRepository }))
  .input(projectParticipantInsertableSchema)
  .mutation(async ({ input, ctx: { authUser, repos } }) => {
    const project = await repos.projectRepository.getById(input.projectId)

    if (authUser.id !== input.userId) {
      checkOwnership(project, authUser, 'remove participant from ')
    }

    return repos.projectParticipantRepository.remove(input)
  })
