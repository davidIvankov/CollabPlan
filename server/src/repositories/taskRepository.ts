import type { Database } from '@server/database'
import { TABLES, TASK_STATUS } from '@server/database/dbConstants'
import {
  taskKeysAll,
  type TaskAssignArgumentsRepo,
  type TaskInsertable,
  type TaskReview,
  type TaskSelectable,
} from '@server/entities/task'

export function taskRepository(db: Database) {
  return {
    async create(taskInsertable: TaskInsertable) {
      return db
        .insertInto(TABLES.TASK)
        .values(taskInsertable)
        .returning(taskKeysAll)
        .executeTakeFirstOrThrow()
    },
    async getByProjectId(projectId: string): Promise<TaskSelectable[]> {
      return db
        .selectFrom(TABLES.TASK)
        .select(taskKeysAll)
        .where('projectId', '=', projectId)
        .execute()
    },
    async getById(taskId: string): Promise<TaskSelectable> {
      return db
        .selectFrom(TABLES.TASK)
        .select(taskKeysAll)
        .where('id', '=', taskId)
        .executeTakeFirstOrThrow()
    },
    async assign(assignValues: TaskAssignArgumentsRepo) {
      const { id, userId, scheduledTime } = assignValues
      return db
        .updateTable(TABLES.TASK)
        .where('id', '=', id)
        .set({ assignedTo: userId, scheduledTime })
        .returning(taskKeysAll)
        .executeTakeFirstOrThrow()
    },
    async unassign(taskId: string) {
      return db
        .updateTable(TABLES.TASK)
        .where('id', '=', taskId)
        .set({ assignedTo: null, scheduledTime: {} })
        .returning(taskKeysAll)
        .executeTakeFirstOrThrow()
    },
    async remove(taskId: string) {
      return db
        .deleteFrom(TABLES.TASK)
        .where('id', '=', taskId)
        .returning(taskKeysAll)
        .executeTakeFirstOrThrow()
    },
    async setDone(taskId: string) {
      return db
        .updateTable(TABLES.TASK)
        .where('id', '=', taskId)
        .set({ status: TASK_STATUS.DONE })
        .returning(['id', 'status'])
        .executeTakeFirstOrThrow()
    },
    async reviewTask(reviewData: TaskReview) {
      const { id, ...updates } = reviewData

      return db
        .updateTable(TABLES.TASK)
        .where('id', '=', id)
        .set(updates)
        .returning(taskKeysAll)
        .executeTakeFirstOrThrow()
    },
  }
}

export type TaskRepository = ReturnType<typeof taskRepository>
