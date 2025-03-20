<script setup lang="ts">
import { logout } from '@/stores/user'
import { useRouter } from 'vue-router'

const router = useRouter()

function logoutUser() {
  logout()
  router.push('/')
}
</script>

<template>
  <button @click="logoutUser" link="#">Logout</button>
</template>
