import type { Database } from '@server/database'
import { userRepository } from './userRepositorsitory'
import { projectRepository } from './projectRepository'

export type RepositoryFactory = <T>(db: Database) => T

// index of all repositories for provideRepos
const repositories = {
  userRepository,
  projectRepository,
}

export type RepositoriesFactories = typeof repositories
export type Repositories = {
  [K in keyof RepositoriesFactories]: ReturnType<RepositoriesFactories[K]>
}
export type RepositoriesKeys = keyof Repositories

export { repositories }
