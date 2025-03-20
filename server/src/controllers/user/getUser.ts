import { idSchema } from '@server/entities/shared'
import { userRepository } from '@server/repositories/userRepositorsitory'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'

export default authenticatedProcedure
  .use(provideRepos({ userRepository }))
  .input(idSchema.optional())
  .query(async ({ input, ctx: { repos, authUser } }) => {
    const id = input || authUser.id
    const userList = await repos.userRepository.get(id)

    return userList
  })
