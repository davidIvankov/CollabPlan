import { router } from '@server/trpc'
import create from './create'
import assign from './assign'
import setReview from './setReview'
import reviewTask from './reviewTask'
import get from './get'

export default router({
  create,
  assign,
  setReview,
  reviewTask,
  get,
})
