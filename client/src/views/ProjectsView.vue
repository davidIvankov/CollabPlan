<script lang="ts" setup>
import { authUserId } from '@/stores/user'
import { onMounted, ref } from 'vue'
import ListComponent from '@/components/ListComponent.vue'
import { getByCreatedBy, getByParticipant } from '@/stores/project'

const usersProjects = ref()
const participatingIn = ref()

onMounted(async () => {
  usersProjects.value = await getByCreatedBy(authUserId.value as string)
  participatingIn.value = await getByParticipant(authUserId.value as string)
})
</script>
<template>
  <div class="projects">
    <ListComponent
      v-if="usersProjects"
      title="My Projects"
      :listItems="usersProjects"
      type="project-basic"
    ></ListComponent>
    <RouterLink to="/dashboard/projects/new" class="add-project-btn btn">+ Add Project</RouterLink>
    <ListComponent
      v-if="participatingIn"
      title="Collaborating in"
      :listItems="participatingIn"
      type="project-with-role"
    ></ListComponent>
  </div>
</template>
<style scoped>
.add-project-btn {
  display: block;
  background-color: var(--button-blue);
  color: var(--white);
}

.projects {
  text-align: left;
  margin-top: 20px;
  margin-bottom: 10vw;
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
