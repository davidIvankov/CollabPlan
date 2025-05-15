import type { Database } from '@server/database'
import { INVITATION_STATUS, TABLES } from '@server/database/dbConstants'
import {
  invitationKeysAll,
  invitationKeysOmitIdAndCreatedAt,
  type InvitationByInvitedUserId,
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
    async getByUserAndProjectId({
      projectId,
      invitedUserId,
    }: Omit<InvitationsInsertable, 'invitedById'>): Promise<
      InvitationsSelectable | undefined
    > {
      return db
        .selectFrom(TABLES.INVITATIONS)
        .where('projectId', '=', projectId)
        .where('invitedUserId', '=', invitedUserId)
        .select(invitationKeysAll)
        .executeTakeFirst()
    },

    async getByInvitedUserId(
      invitedUserId: string
    ): Promise<InvitationByInvitedUserId[]> {
      return db
        .selectFrom(TABLES.INVITATIONS)
        .where('invitedUserId', '=', invitedUserId)
        .where('status', '=', INVITATION_STATUS.PENDING)
        .innerJoin(TABLES.PROJECT, 'project.id', 'invitations.projectId')
        .innerJoin(TABLES.USER, 'user.id', 'invitations.invitedById')
        .select([
          ...invitationKeysOmitIdAndCreatedAt,
          'invitations.createdAt as createdAt',
          'invitations.id as id',
          'user.name as invitedByName',
          'project.name as projectName',
        ])
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
