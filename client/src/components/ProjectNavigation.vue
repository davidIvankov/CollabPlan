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
      data-testid="tasks"
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

@media (min-width: 1024px) {
  .navigation {
    justify-content: space-between; /* Add more space between items */
    width: 200px;
    gap: 2vw;
    margin: 20px auto; /* Reduce top margin and center horizontally */
  }

  .nav-item {
    font-size: var(--desktop-text); /* Use a larger font size for desktop */
    width: auto; /* Allow items to size dynamically */
    padding: 12px 20px; /* Add more padding for better spacing */
  }
}
</style>
