import { userRepository } from '@server/repositories/userRepositorsitory'
import { publicProcedure } from '@server/trpc'
import provideRepos from '@server/trpc/provideRepos'
import { z } from 'zod'

export default publicProcedure
  .use(provideRepos({ userRepository }))
  .input(z.string().min(1))
  .query(async ({ input, ctx: { repos } }) => {
    const userList = await repos.userRepository.search(input)

    return userList
  })
