// e2e/global-teardown.ts
import { deleteAllRecords } from './api'

export default async function globalTeardown() {
  console.log('🧹 Running global teardown...')
  await deleteAllRecords()
}
