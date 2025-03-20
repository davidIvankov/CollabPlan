import { isLoggedIn } from '@/stores/user'

export const authenticate = () => {
  if (!isLoggedIn.value) return { path: 'login' }

  return true
}
