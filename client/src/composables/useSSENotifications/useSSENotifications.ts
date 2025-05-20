// composables/useSSENotifications.ts
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { getStoredAccessToken } from '@/utils/auth'
import { onBeforeUnmount } from 'vue'
import { apiOrigin } from '@/config'

export type EventData = { type: 'PROJECT_NOTIFICATION' | 'INVITATION' }

export function useSSENotifications(onMessage: (data: EventData) => void) {
  let controller: AbortController | null = null

  function startListening() {
    const token = getStoredAccessToken(localStorage)
    if (!token) return

    controller = new AbortController()

    fetchEventSource(`${apiOrigin}/api/v1/sse/notifications`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
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
        // Reconnect logic can go here if desired
      },
    })
  }

  function stopListening() {
    controller?.abort()
  }

  onBeforeUnmount(() => {
    stopListening()
  })

  return {
    startListening,
    stopListening,
  }
}
