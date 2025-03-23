import type { Database } from '@server/database'
import { TABLES } from '@server/database/dbConstants'
import {
  projectKeysPublic,
  type ProjectByParticipant,
  type ProjectInsertable,
  type ProjectPublic,
  type ProjectUpdate,
} from '@server/entities/project'

export function projectRepository(db: Database) {
  return {
    async create(insertableProject: ProjectInsertable): Promise<ProjectPublic> {
      return db
        .insertInto(TABLES.PROJECT)
        .values(insertableProject)
        .returning(projectKeysPublic)
        .executeTakeFirstOrThrow()
    },
    async getByCreatedBy(userId: string | null): Promise<ProjectPublic[]> {
      return db
        .selectFrom(TABLES.PROJECT)
        .select(projectKeysPublic)
        .where('createdBy', '=', userId)
        .execute()
    },
    async getByParticipantId(
      userId: string | null
    ): Promise<ProjectByParticipant[]> {
      return db
        .selectFrom(TABLES.PROJECT)
        .innerJoin(
          TABLES.PROJECT_PARTICIPANT,
          'project.id',
          'projectParticipant.projectId'
        )
        .where('userId', '=', userId)
        .select(['project.id', 'project.name', 'projectParticipant.role'])
        .$castTo<ProjectByParticipant>()
        .execute()
    },
    async getById(projectId: string): Promise<ProjectPublic | undefined> {
      return db
        .selectFrom(TABLES.PROJECT)
        .select(projectKeysPublic)
        .where('id', '=', projectId)
        .executeTakeFirst()
    },

    async update(newProject: ProjectUpdate) {
      const { id, name, description } = newProject
      return db
        .updateTable(TABLES.PROJECT)
        .set({ name, description })
        .where('id', '=', id)
        .returning(projectKeysPublic)
        .executeTakeFirst()
    },
    async remove(id: string) {
      return db
        .deleteFrom(TABLES.PROJECT)
        .where('id', '=', id)
        .returning(projectKeysPublic)
        .executeTakeFirst()
    },
  }
}

export type ArticleRepository = ReturnType<typeof projectRepository>
