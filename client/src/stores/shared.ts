import { ref } from 'vue'

export const showNotifications = ref(false)
export const showInvitations = ref(false)

export const toggleOffPanels = () => {
  showNotifications.value = false
  showInvitations.value = false
}
