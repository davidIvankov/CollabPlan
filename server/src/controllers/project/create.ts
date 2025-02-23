import { projectInsertableSchema } from '@server/entities/project'
import { projectParticipantRepository } from '@server/repositories/projectParticipantRepo'
import { projectRepository } from '@server/repositories/projectRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'

export default authenticatedProcedure
  .use(provideRepos({ projectRepository, projectParticipantRepository }))
  .input(projectInsertableSchema)
  .mutation(async ({ input, ctx: { authUser, repos } }) => {
    const projectCreated = await repos.projectRepository.create({
      ...input,
      createdBy: authUser.id,
    })
    const projectId = projectCreated.id
    repos.projectParticipantRepository.create({
      userId: authUser.id,
      projectId,
      role: 'admin',
    })
    return projectCreated
  })
