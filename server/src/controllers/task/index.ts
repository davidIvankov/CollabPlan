import { router } from '@server/trpc'
import create from './create'
import assign from './assign'

export default router({
  create,
  assign,
})
