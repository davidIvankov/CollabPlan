import { onMounted, onBeforeUnmount, type Ref } from 'vue'

export function useClickAway(
  targetEl: Ref<HTMLElement | null>,
  handler: (event: MouseEvent) => void
) {
  const listener = (event: MouseEvent) => {
    if (!targetEl.value) return
    if (!targetEl.value.contains(event.target as Node)) {
      handler(event)
    }
  }

  onMounted(() => {
    document.addEventListener('click', listener)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('click', listener)
  })
}
