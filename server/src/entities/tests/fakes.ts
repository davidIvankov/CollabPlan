import type { User } from '@server/database/types'
import type { Insertable } from 'kysely'
import { random } from '@tests/utils/random'
import { v4 as uuidv4 } from 'uuid'
import type { AuthUser, UserPublic } from '../user'

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
