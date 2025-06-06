import type { Database } from '@server/database'
import { userRepository } from './userRepositorsitory'
import { projectRepository } from './projectRepository'
import { projectParticipantRepository } from './projectParticipantRepo'
import { taskRepository } from './taskRepository'
import { invitationsRepository } from './invitationsRepository'
import { notificationRepository } from './notificationRepository'
import { passwordResetRepository } from './passwordResetTokenRepository'

export type RepositoryFactory = <T>(db: Database) => T

// index of all repositories for provideRepos
const repositories = {
  userRepository,
  projectRepository,
  projectParticipantRepository,
  taskRepository,
  invitationsRepository,
  notificationRepository,
  passwordResetRepository,
}

export type RepositoriesFactories = typeof repositories
export type Repositories = {
  [K in keyof RepositoriesFactories]: ReturnType<RepositoriesFactories[K]>
}
export type RepositoriesKeys = keyof Repositories

export { repositories }
