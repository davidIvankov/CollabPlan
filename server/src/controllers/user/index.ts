import { router } from '@server/trpc'
import login from './login'
import signup from './signup'
import search from './search'

export default router({
  login,
  signup,
  search,
})
