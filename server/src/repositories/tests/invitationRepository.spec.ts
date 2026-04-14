import { createTestDatabase } from '@tests/utils/database'
import { fakeProject, fakeUser } from '@server/entities/tests/fakes'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { clearTables, insertAll } from '@tests/utils/records'
import { INVITATION_STATUS, TABLES } from '../../database/dbConstants'
import { invitationsRepository } from '../invitationsRepository'

const db = await wrapInRollbacks(createTestDatabase())
const repository = invitationsRepository(db)

await clearTables(db, [TABLES.USER, TABLES.PROJECT])
const [userOne, userTwo] = await insertAll(db, 'user', [
  fakeUser(),
  fakeUser({ email: 'stipe@gmail.com' }),
])
const [project] = await insertAll(db, TABLES.PROJECT, [
  fakeProject({ createdBy: userOne.id }),
  fakeProject({ createdBy: userTwo.id }),
])

const [invitation] = await insertAll(db, TABLES.INVITATIONS, [
  {
    projectId: project.id,
    invitedById: userOne.id,
    invitedUserId: userTwo.id,
  },
])

describe('update', () => {
  it('updates invitation with new date', async () => {
    const { createdAt } = invitation
    const updatedInvitation = await repository.update({
      id: invitation.id,
      projectId: project.id,
      status: INVITATION_STATUS.PENDING,
    })

    expect(updatedInvitation?.createdAt).not.toBe(createdAt)
  })
})
