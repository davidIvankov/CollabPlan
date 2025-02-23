import type { Database } from '@server/database'
import { TABLES } from '@server/database/dbConstants'
import { taskKeysAll, type TaskInsertable } from '@server/entities/task'

export function taskRepository(db: Database) {
  return {
    async create(taskInsertable: TaskInsertable) {
      return db
        .insertInto(TABLES.TASK)
        .values(taskInsertable)
        .returning(taskKeysAll)
        .executeTakeFirstOrThrow()
    },
  }
}

export type TaskRepository = ReturnType<typeof taskRepository>
