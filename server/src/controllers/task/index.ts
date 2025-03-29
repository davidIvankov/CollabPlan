import { router } from '@server/trpc'
import create from './create'
import assign from './assign'
import reviewTask from './reviewTask'
import get from './get'
import setDone from './setDone'
import remove from './remove'

export default router({
  create,
  assign,
  setDone,
  reviewTask,
  get,
  remove,
})
