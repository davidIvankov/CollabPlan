import type { Database } from '@server/database'
import { TABLES } from '@server/database/dbConstants'
import {
  projectKeysPublic,
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
    async getByCreatedBy(userId: string): Promise<ProjectPublic[]> {
      return db
        .selectFrom(TABLES.PROJECT)
        .select(projectKeysPublic)
        .where('createdBy', '=', userId)
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
      const { id, name } = newProject
      return db
        .updateTable(TABLES.PROJECT)
        .set({ name })
        .where('id', '=', id)
        .returning(projectKeysPublic)
        .executeTakeFirst()
    },
  }
}

export type ArticleRepository = ReturnType<typeof projectRepository>
