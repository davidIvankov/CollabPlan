import type {
  Project,
  ProjectParticipant,
  Task,
  User,
} from '@server/database/types'
import type { Insertable } from 'kysely'
import { random } from '@tests/utils/random'
import { v4 as uuidv4 } from 'uuid'
import type { AuthUser, UserPublic } from '../user'
import type { ProjectInsertableNoUser } from '../project'
import type { TaskInsertable } from '../task'

export const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/**
 * Generates a fake user with some default test data.
 * @param overrides Any properties that should be different from default fake data.
 */
export const fakeUser = <T extends Partial<Insertable<User>>>(
  overrides: T = {} as T
) =>
  ({
    name: 'John Doe',
    email: 'johndoe@example.com',
    password: 'Password.123!',
    ...overrides,
  }) satisfies Insertable<User>

export const fakePublicUser = <T extends Partial<Insertable<User>>>(
  overrides: T = {} as T
) => ({
  name: 'John Doe',
  email: 'johndoe@example.com',
  ...overrides,
})

export const fakeInsertableTask = <T extends Partial<Insertable<Task>>>(
  overrides: T
): TaskInsertable => ({
  duration: 120,
  name: random.string(),
  projectId: uuidv4(),
  ...overrides,
})

export const fakeTask = <T extends Partial<Task>>(overrides: T): Task => ({
  status: 'todo',
  id: uuidv4(),
  createdAt: new Date(),
  duration: random.integer(),
  name: random.string(),
  projectId: uuidv4(),
  assignedTo: null,
  scheduledTime: {},
  description: null,
  ...overrides,
})

export const fakeAuthUser = <T extends Partial<AuthUser>>(
  overrides: T = {} as T
): AuthUser => ({
  id: uuidv4(),
  email: random.email(),
  ...overrides,
})

export const userMatcher = (overrides: Partial<Insertable<User>> = {}) => ({
  id: expect.stringMatching(uuidRegex),
  ...overrides, // for id
  ...fakeUser(overrides),
})

export const userPublicMatcher = (
  overrides: Partial<Insertable<UserPublic>> = {}
): UserPublic => ({
  id: expect.stringMatching(uuidRegex),
  ...overrides,
  ...fakePublicUser(overrides),
})
export const fakeProjectParticipant = <
  T extends Partial<Insertable<ProjectParticipant>>,
>(
  overrides: T
): Insertable<ProjectParticipant> => ({
  projectId: uuidv4(),
  userId: uuidv4(),
  ...overrides,
})

export const fakeProject = <T extends Partial<Insertable<Project>>>(
  overrides: T
): Insertable<Project> => ({
  name: random.string(),
  createdBy: uuidv4(),
  ...overrides,
})

export const fakeInsertableProjectNoUser = <
  T extends Partial<Insertable<Project>>,
>(
  overrides: T
): ProjectInsertableNoUser => ({
  name: random.string(),
  ...overrides,
})

export const projectMatcher = (
  overrides: Partial<Insertable<Project>> = {}
) => ({
  id: expect.stringMatching(uuidRegex),
  createdAt: expect.any(Date),
  ...overrides, // for id
  ...fakeProject(overrides),
})

export const projectParticipantMatcher = (
  overrides: Partial<Insertable<ProjectParticipant>>
) => ({
  projectId: expect.stringMatching(uuidRegex),
  userId: expect.stringMatching(uuidRegex),
  role: 'member',
  availability: [],
  ...overrides,
})
