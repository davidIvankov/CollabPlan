<script lang="ts" setup>
import { trpc } from '@/trpc'
import { onMounted } from 'vue'

onMounted(async () => {
  const users = await trpc.user.search.query('dsadf')
  console.log(users)
})
</script>

<template>
  <header class="header">
    <h1 class="app-name" data-testid="app-name">CollabPlan</h1>
    <p class="tagline">Your Collaborative Planning Hub</p>
  </header>
  <main class="content">
    <p class="intro-text">
      Organize your tasks, collaborate with your team, and get things done efficiently.
    </p>
    <div class="buttons">
      <RouterLink :to="'/login'"> Login </RouterLink>
      <RouterLink :to="'/signup'"> Sign Up </RouterLink>
    </div>
  </main>
</template>
