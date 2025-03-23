import type { ProjectPublic } from '@server/entities/project'
import { idSchema } from '@server/entities/shared'
import { projectRepository } from '@server/repositories/projectRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'

export default authenticatedProcedure
  .use(provideRepos({ projectRepository }))
  .input(idSchema.optional())
  .query(
    async ({ input, ctx: { repos, authUser } }): Promise<ProjectPublic[]> => {
      const createdBy = input || authUser.id
      const project = await repos.projectRepository.getByCreatedBy(createdBy)

      return project
    }
  )
