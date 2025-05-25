import { router } from '@server/trpc'
import login from './login'
import signup from './signup'
import search from './search'
import getUser from './getUser'
import sendResetEmail from './sendResetEmail'
import resetPassword from './resetPassword'

export default router({
  login,
  signup,
  search,
  getUser,
  sendResetEmail,
  resetPassword,
})
