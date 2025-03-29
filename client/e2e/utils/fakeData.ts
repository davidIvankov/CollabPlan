import type { Project, User, ProjectParticipant } from '@server/shared/types'
import type { Insertable } from 'kysely'
import { Chance } from 'chance'

// Chance is a lightweight fake data generator.
// Faker.js is another popular library, but it is relatively slow to import.
// Also, if we are running tests in CI server, we want to use the same seed
// every time to make the tests deterministic.
export const random = process.env.CI ? Chance(1) : Chance()

/**
 * Creates a new user with a random email and password. We want a random email
 * as our E2E tests can run against a real database, and we don't want to
 * our tests to fail because of a duplicate email.
 */
export const fakeUser = <T extends Insertable<User>>(overrides: Partial<T> = {} as T) => ({
  email: random.email(),
  password: 'password.123',
  name: random.first(),
  ...overrides,
})

export const fakeProject = <T extends Partial<Insertable<Project>>>(overrides: T = {} as T) => ({
  name: random.string(),
  description: random.sentence({ words: 5 }),
  ...overrides,
})

export const fakeTask = <T extends Partial<Insertable<ProjectParticipant>>>(
  overrides: T = {} as T
) => ({
  name: random.sentence({ words: 5 }),
  description: random.paragraph(),
  duration: 120,

  ...overrides,
})
