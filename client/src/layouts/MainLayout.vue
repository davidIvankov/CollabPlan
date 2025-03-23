<script setup lang="ts">
import Navigation from '@/components/Navigation.vue'
import { logout } from '@/stores/user'
import { useRouter } from 'vue-router'

const router = useRouter()

function logoutUser() {
  logout()
  router.push('/login')
}
</script>

<template>
  <button @click="logoutUser" data-testid="logout">
    <img src="@/assets/icons/logout.svg" alt="logout" class="logout" />
  </button>
  <RouterView />
  <Navigation></Navigation>
</template>
<style scoped>
.logout {
  background-color: var(--grey-icon);
  padding: 12px;
  width: 24px;
  height: 24px;
}

button {
  border-radius: 50%;
  overflow: hidden;
  height: 48px;
  width: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 24px;
  right: 24px;
}
</style>
