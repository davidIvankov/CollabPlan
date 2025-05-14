import { deleteAllRecords } from './api'

export default async function globalSetup() {
  console.log('🧹 Running global setup...')
  await deleteAllRecords()
}
