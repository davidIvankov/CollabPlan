// composables/useSSENotifications.ts
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { getStoredAccessToken } from '@/utils/auth'
import { onBeforeUnmount } from 'vue'
import { apiOrigin } from '@/config'

export type EventData = { type: 'PROJECT_NOTIFICATION' | 'INVITATION' }

export function useSSENotifications(onMessage: (data: EventData) => void) {
  let controller: AbortController | null = null

  function startListening(retryCount = 0) {
    // Abort previous controller if exists
    if (controller) {
      controller.abort()
      controller = null
    }
    const token = getStoredAccessToken(localStorage)
    if (!token) return

    controller = new AbortController()
    const MAX_RETRIES = 5
    const RETRY_DELAY = 2000

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
        if (retryCount < MAX_RETRIES) {
          setTimeout(() => {
            startListening(retryCount + 1)
          }, RETRY_DELAY)
        } else {
          console.error('SSE: Max retries reached, giving up.')
        }
      },
    })
  }

  function stopListening() {
    controller?.abort()
    controller = null
  }

  onBeforeUnmount(() => {
    stopListening()
  })

  return {
    startListening,
    stopListening,
  }
}
