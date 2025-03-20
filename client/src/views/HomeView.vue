<script lang="ts" setup></script>

<template>
  <header class="header">
    <h1 class="app-name" data-testid="app-name">CollabPlan</h1>
    <p class="tagline">Your Collaborative Planning Hub</p>
  </header>
  <main class="content">
    <div class="buttons">
      <RouterLink to="/login" class="btn">Login</RouterLink>
      <RouterLink to="/signup" class="btn">Registration</RouterLink>
    </div>
  </main>
</template>
<style scoped>
.header {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  height: 50vh;
}

.app-name {
  font-size: var(--mobile-hero);
  line-height: 10px;
  color: var(--text-green);
}

.buttons {
  height: 40vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: 2vh;
}
</style>
