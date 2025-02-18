import type { Database } from '@server/database'

export function projectRepository(db: Database) {
  return {
    async create() {
      return db
    },
  }
}

export type ArticleRepository = ReturnType<typeof projectRepository>
