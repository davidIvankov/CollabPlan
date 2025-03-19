<script lang="ts" setup></script>

<template>
  <header class="header">
    <h1 class="app-name" data-testid="app-name">CollabPlan</h1>
    <p class="tagline">Your Collaborative Planning Hub</p>
  </header>
  <main class="content">
    <div class="buttons">
      <RouterLink to="" class="btn">Login</RouterLink>
      <RouterLink to="" class="btn">Registration</RouterLink>
    </div>
  </main>
</template>
<style>
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

.btn {
  background-color: var(--white);
  color: var(--background-grey);
  width: calc(100% - 48px);
  text-align: center;
  padding: 14px;
  font-size: 18px;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
</style>
