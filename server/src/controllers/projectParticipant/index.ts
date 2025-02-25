import { router } from '@server/trpc'
import create from './create'
import setAvailability from './setAvailability'
import changeRole from './changeRole'

export default router({
  create,
  setAvailability,
  changeRole,
})
