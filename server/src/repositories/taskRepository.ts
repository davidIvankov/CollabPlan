import type { Database } from '@server/database'
import { TABLES, TASK_STATUS } from '@server/database/dbConstants'
import {
  documentKeys,
  taskKeysAll,
  taskKeysPublic,
  type DocumentParams,
  type SetDoneArgs,
  type TaskAssignArgumentsRepo,
  type TaskInsertable,
  type TaskSelectable,
} from '@server/entities/task'
import { sql } from 'kysely'

const embeddingParser = (str: string): string => {
  const vectorArray = JSON.parse(str) as number[]

  const vectorStr = vectorArray.join(', ')

  return sql`'[${sql.raw(vectorStr)}]'::vector` as unknown as string
}

export function taskRepository(db: Database) {
  return {
    async create(taskInsertable: TaskInsertable) {
      return db
        .insertInto(TABLES.TASK)
        .values(taskInsertable)
        .returning(taskKeysPublic)
        .executeTakeFirstOrThrow()
    },
    async getByEmbedding(
      stringifiedEmbedding: string
    ): Promise<DocumentParams[]> {
      const embedding = embeddingParser(stringifiedEmbedding)
      return db
        .selectFrom(TABLES.TASK)
        .orderBy(sql`embedding <#> ${embedding}`)
        .limit(5)
        .innerJoin(TABLES.PROJECT, 'projectId', 'project.id')
        .select(documentKeys)
        .execute()
    },
    async getByProjectId(projectId: string): Promise<TaskSelectable[]> {
      return db
        .selectFrom(TABLES.TASK)
        .select(taskKeysPublic)
        .where('projectId', '=', projectId)
        .execute()
    },
    async getById(taskId: string): Promise<TaskSelectable> {
      return db
        .selectFrom(TABLES.TASK)
        .select(taskKeysPublic)
        .where('id', '=', taskId)
        .executeTakeFirstOrThrow()
    },
    async assign(assignValues: TaskAssignArgumentsRepo) {
      const { id, userId, scheduledTime } = assignValues
      return db
        .updateTable(TABLES.TASK)
        .where('id', '=', id)
        .set({ assignedTo: userId, scheduledTime })
        .returning(taskKeysPublic)
        .executeTakeFirstOrThrow()
    },
    async unassign(taskId: string) {
      return db
        .updateTable(TABLES.TASK)
        .where('id', '=', taskId)
        .set({ assignedTo: null, scheduledTime: {} })
        .returning(taskKeysPublic)
        .executeTakeFirstOrThrow()
    },
    async remove(taskId: string) {
      return db
        .deleteFrom(TABLES.TASK)
        .where('id', '=', taskId)
        .returning(taskKeysPublic)
        .executeTakeFirstOrThrow()
    },
    async setDone({
      id,
      actualDuration,
      embedding: stringifiedEmbedding,
    }: SetDoneArgs) {
      const embedding = embeddingParser(stringifiedEmbedding as string)
      return db
        .updateTable(TABLES.TASK)
        .where('id', '=', id)
        .set({ status: TASK_STATUS.DONE, actualDuration, embedding })
        .returning(taskKeysAll)
        .executeTakeFirstOrThrow()
    },

    async deleteAll(): Promise<void> {
      db.deleteFrom(TABLES.TASK).execute()
    },
  }
}

export type TaskRepository = ReturnType<typeof taskRepository>
