import { router } from '@server/trpc'
import create from './create'
import getById from './getById'
import update from './update'
import getByCreatedBy from './getByCreatedBy'

export default router({
  create,
  getById,
  update,
  getByCreatedBy,
})
