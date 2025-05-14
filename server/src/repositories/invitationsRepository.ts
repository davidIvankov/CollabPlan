import type { Database } from '@server/database'
import { INVITATION_STATUS, TABLES } from '@server/database/dbConstants'
import {
  invitationKeysAll,
  type InvitationsInsertable,
  type InvitationsSelectable,
  type InvitationsUpdatable,
} from '@server/entities/invitation'

export function invitationsRepository(db: Database) {
  return {
    async create(
      invitation: InvitationsInsertable
    ): Promise<InvitationsSelectable> {
      return db
        .insertInto(TABLES.INVITATIONS)
        .values(invitation)
        .returning(invitationKeysAll)
        .executeTakeFirstOrThrow()
    },
    async update({
      projectId,
      id,
      status,
    }: InvitationsUpdatable): Promise<InvitationsSelectable | undefined> {
      return db
        .updateTable(TABLES.INVITATIONS)
        .where('projectId', '=', projectId)
        .where('id', '=', id)
        .where('status', '=', INVITATION_STATUS.PENDING)
        .set({ status })
        .returning(invitationKeysAll)
        .executeTakeFirst()
    },
    async getByProjectId(projectId: string): Promise<InvitationsSelectable[]> {
      return db
        .selectFrom(TABLES.INVITATIONS)
        .where('projectId', '=', projectId)
        .where('status', '!=', INVITATION_STATUS.ACCEPTED)
        .select(invitationKeysAll)
        .execute()
    },
    async delete({
      invitedById,
      invitedUserId,
      projectId,
    }: InvitationsInsertable): Promise<InvitationsSelectable | undefined> {
      return db
        .deleteFrom(TABLES.INVITATIONS)
        .where('invitedById', '=', invitedById)
        .where('invitedUserId', '=', invitedUserId)
        .where('projectId', '=', projectId)
        .returning(invitationKeysAll)
        .executeTakeFirst()
    },
    async deleteAll(): Promise<void> {
      db.deleteFrom(TABLES.INVITATIONS).execute()
    },
  }
}

export type InvitationsRepository = ReturnType<typeof invitationsRepository>
