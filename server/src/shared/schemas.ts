import { userSchema } from '@server/entities/user'

export const signupInputSchema = userSchema.pick({
  email: true,
  password: true,
  name: true,
})
