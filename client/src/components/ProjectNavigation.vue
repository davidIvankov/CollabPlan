<script setup lang="ts">
defineProps<{
  projectId: string
}>()
</script>

<template>
  <nav class="navigation">
    <RouterLink
      :to="`/dashboard/projects/${projectId}/details`"
      class="nav-item"
      active-class="active"
    >
      Details
    </RouterLink>

    <RouterLink
      :to="`/dashboard/projects/${projectId}/tasks`"
      class="nav-item"
      active-class="active"
    >
      Tasks
    </RouterLink>
  </nav>
</template>

<style scoped>
.navigation {
  display: flex;
  justify-content: space-around;
  width: 100%;
  background-color: var(--background-grey);
  padding: 12px;
  border-radius: 8px;
  margin-top: 16vw;
}

.nav-item {
  color: var(--white);
  text-decoration: none;
  font-size: var(--mobile-text);
  text-align: center;
  padding: 10px 16px;
  border-radius: 6px;
  transition: background 0.3s ease;
  width: 50%;
}

.nav-item:hover {
  background-color: var(--button-blue);
}

.active {
  background-color: var(--text-green);
  color: var(--background-grey);
}
</style>
