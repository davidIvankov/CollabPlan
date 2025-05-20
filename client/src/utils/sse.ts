import { fetchEventSource } from '@microsoft/fetch-event-source'
import { getStoredAccessToken } from '@/utils/auth'

export function listenToNotifications(onMessage: (data: any) => void) {
  const token = getStoredAccessToken(localStorage)
  if (!token) return () => {}

  const controller = new AbortController()

  fetchEventSource('/api/v1/sse/notifications', {
    signal: controller.signal,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    onmessage(event) {
      try {
        const data = JSON.parse(event.data)
        onMessage(data)
      } catch (err) {
        console.error('Invalid SSE data', err)
      }
    },
    onerror(err) {
      console.error('SSE error:', err)
    },
  })

  return () => controller.abort()
}
