import { wrapInRollbacks } from '@tests/utils/transactions'
import { createTestDatabase } from '@tests/utils/database'
import { clearTables, insertAll } from '@tests/utils/records'
import {
  fakeUser,
  userMatcher,
  userPublicMatcher,
} from '@server/entities/tests/fakes'
import { TABLES } from '@server/database/dbConstants'
import { userRepository } from '../userRepositorsitory'

const db = await wrapInRollbacks(createTestDatabase())
const repository = userRepository(db)

describe('create', () => {
  beforeAll(async () => {
    await clearTables(db, [TABLES.USER])
  })

  it('creates user', async () => {
    const user = fakeUser()

    const insertion = await repository.create(user)
    const { password, ...userWithoutPassword } = user

    expect(insertion).toEqual(userPublicMatcher(userWithoutPassword))
  })
})
describe('findByEmail', () => {
  beforeAll(async () => {
    await clearTables(db, [TABLES.USER])
  })

  it('finds user when email provided', async () => {
    const user = fakeUser()
    await insertAll(db, TABLES.USER, [fakeUser()])
    const selection = await repository.findByEmail(user.email)

    expect(selection).toEqual(userMatcher(user))
  })
})

describe('search', () => {
  const users = [
    fakeUser({ name: 'Alice Johnson', email: 'alice@example.com' }),
    fakeUser({ name: 'Bob Smith', email: 'bob@example.com' }),
    fakeUser({ name: 'Charlie Brown', email: 'charlie@example.com' }),
  ]
  beforeAll(async () => {
    await clearTables(db, [TABLES.USER])
    await insertAll(db, TABLES.USER, users)
  })

  test('should find a user by name', async () => {
    const results = await repository.search('Alice')

    expect(results.length).toBeGreaterThan(0)
    expect(results[0].name).toContain('Alice')
  })

  test('should find a user by email', async () => {
    const results = await repository.search('bob@example.com')

    expect(results.length).toBeGreaterThan(0)
    expect(results[0].email).toBe('bob@example.com')
  })

  test('should return an empty array for non-existent users', async () => {
    const results = await repository.search('nonexistent')

    expect(results.length).toBe(0)
  })
})
