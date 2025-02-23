import { router } from '@server/trpc'
import create from './create'
import setAvailability from './setAvailability'

export default router({
  create,
  setAvailability,
})
