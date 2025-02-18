import { wrapInRollbacks } from '@tests/utils/transactions'
import { createTestDatabase } from '@tests/utils/database'
import { clearTables } from '@tests/utils/records'
import {
  fakeUser,
  userMatcher,
  userPublicMatcher,
} from '@server/entities/tests/fakes'
import { userRepository } from '../userRepositorsitory'

const db = await wrapInRollbacks(createTestDatabase())
const repository = userRepository(db)

describe('create', () => {
  beforeAll(async () => {
    await clearTables(db, ['user'])
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
    await clearTables(db, ['user'])
  })

  it('finds user when email provided', async () => {
    const user = fakeUser()
    await repository.create(user)

    const selection = await repository.findByEmail(user.email)

    expect(selection).toEqual(userMatcher(user))
  })
})
