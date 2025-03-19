import bcrypt from 'bcrypt'
import config from '@server/config'
import jsonwebtoken from 'jsonwebtoken'
import { publicProcedure } from '@server/trpc'
import { TRPCError } from '@trpc/server'
import { userSchema } from '@server/entities/user'
import provideRepos from '@server/trpc/provideRepos'
import { prepareTokenPayload } from '@server/trpc/tokenPayload'
import { userRepository } from '@server/repositories/userRepositorsitory'

const { expiresIn, tokenKey } = config.auth

export default publicProcedure
  .use(
    provideRepos({
      userRepository,
    })
  )
  .input(
    userSchema.pick({
      email: true,
      password: true,
    })
  )
  .mutation(async ({ input: { email, password }, ctx: { repos } }) => {
    const user = await repos.userRepository.findByEmail(email)
    const message = 'Invalid email or password. Please try again.'

    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message,
      })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message,
      })
    }

    // What we will include in the token.
    const payload = prepareTokenPayload(user)

    const accessToken = jsonwebtoken.sign(payload, tokenKey, {
      expiresIn,
    })

    return {
      accessToken,
    }
  })
