<script lang="ts" setup>
import { getUser } from '@/stores/user'
import { onMounted, ref, computed, type Ref } from 'vue'
import ListComponent from '@/components/ListComponent.vue'
import type { UserPublic } from '../../../server/src/entities/user'
import { getByCreatedBy } from '@/stores/project'
import type { ProjectPublic } from '@server/shared/types'

const user: Ref<UserPublic | undefined> = ref()
const usersProjects = ref()

onMounted(async () => {
  user.value = await getUser()
  const fetchedProjects = await getByCreatedBy()
  console.log(fetchedProjects)

  usersProjects.value = fetchedProjects
  console.log(usersProjects.value)
})
const userInitials = computed(() => {
  return user.value?.name ? user.value.name.substring(0, 2).toUpperCase() : ''
})
</script>
<template>
  <div class="profile" v-if="user">
    <div class="user-icon">
      {{ userInitials }}
    </div>

    <h2 class="user-name">{{ user.name }}</h2>
    <p class="user-email">{{ user.email }}</p>

    <div class="projects">
      <ListComponent
        v-if="usersProjects"
        title="My Projects"
        :listItems="usersProjects"
        type="project-basic"
      ></ListComponent>
      <RouterLink to="/dashboard/add-project" class="add-project-btn">+ Add Project</RouterLink>
      <h3>Collaborating In</h3>
      <ul></ul>
    </div>
  </div>
</template>

<style scoped>
.add-project-btn {
  display: block;
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  text-decoration: none; /* Remove default link underline */
  color: #fff;
  background: #1abc9c; /* Teal color for visibility */
  border-radius: 8px;
  transition: background 0.3s;
}

.add-project-btn:hover {
  background: #16a085; /* Darker teal on hover */
}
.profile {
  font-family: Arial, sans-serif;
  padding: 16px;
  text-align: center;
  max-width: 400px; /* Limit width for mobile */
  margin: auto;
  color: var(--white); /* Light text for dark background */
}

.user-icon {
  width: 60px;
  height: 60px;
  line-height: 60px;
  border-radius: 50%;
  background-color: var(--text-green); /* Soft teal for contrast */
  color: var(--background-grey); /* Dark text for visibility */
  font-weight: bold;
  font-size: 22px;
  text-align: center;
  display: inline-block;
  margin-bottom: 10px;
}

.user-name {
  font-size: 20px;
  font-weight: bold;
  margin: 5px 0;
}

.user-email {
  font-size: 14px;
  color: #bbb; /* Lighter text for readability */
}

.projects {
  text-align: left;
  margin-top: 20px;
}

h3 {
  font-size: 18px;
  color: #ddd; /* Softer than white for better contrast */
  margin-bottom: 8px;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  background: #333; /* Darker gray for contrast */
  margin: 4px 0;
  padding: 10px;
  border-radius: 8px;
  font-size: 16px;
  color: #fff; /* White text */
  border: 1px solid #444; /* Subtle border */
}

/* Add hover effect for better UI */
li:hover {
  background: #444;
}
</style>
