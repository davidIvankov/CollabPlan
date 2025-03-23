import { router } from '@server/trpc'
import create from './create'
import getById from './getById'
import update from './update'
import getByCreatedBy from './getByCreatedBy'
import deleteProject from './deleteProject'
import getByParticipant from './getByParticipant'

export default router({
  create,
  getById,
  update,
  getByCreatedBy,
  deleteProject,
  getByParticipant,
})
