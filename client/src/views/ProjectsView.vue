<script lang="ts" setup>
import { authUserId } from '@/stores/user'
import { onMounted, ref } from 'vue'
import ListComponent from '@/components/ListComponent.vue'
import { updateParticipatingIn, updateUsersProjects } from '@/stores/project'
import { usersProjects, participatingIn } from '@/stores/project'

onMounted(async () => {
  await updateUsersProjects(authUserId.value as string)
  await updateParticipatingIn(authUserId.value as string)
})
</script>
<template>
  <div class="projects">
    <div class="lists-container">
      <!-- First list -->
      <div class="list">
        <ListComponent
          v-if="usersProjects"
          title="My Projects"
          :listItems="usersProjects"
          type="project-basic"
        ></ListComponent>
      </div>

      <!-- Second list -->
      <div class="list">
        <ListComponent
          v-if="participatingIn"
          title="Collaborating in"
          :listItems="participatingIn"
          type="project-with-role"
        ></ListComponent>
      </div>
    </div>

    <RouterLink to="/dashboard/projects/new" class="add-project-btn btn">+ Add Project</RouterLink>
  </div>
</template>
<style scoped>
.add-project-btn {
  display: block;
  background-color: var(--button-blue);
  color: var(--white);
  text-align: center;
  padding: 10px;
  border-radius: 5px;
  margin: 10px 0;
}

.projects {
  text-align: left;
  margin-top: 20px;
  margin-bottom: 10vw;
}

/* Container for the two lists */
.lists-container {
  display: flex;
  flex-direction: column; /* Default for smaller screens */
  gap: 20px;
}

/* Individual list styles */
.list {
  flex: 1;
  display: flex;
  align-items: flex-start;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

h3 {
  font-size: 18px;
  color: #ddd;
  margin-bottom: 8px;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  background: #333;
  margin: 4px 0;
  padding: 10px;
  border-radius: 8px;
  font-size: 16px;
  color: #fff;
  border: 1px solid #444;
}

li:hover {
  background: #444;
}

/* Media query for tablets (768px to 1024px) */
@media (min-width: 768px) and (max-width: 1024px) {
  .projects {
    text-align: center;
    margin-top: 32px;
    margin-bottom: 8vw;
  }

  .add-project-btn {
    font-size: 16px;
    padding: 12px;
    margin: 15px auto;
    width: 80%; /* Center the button and make it wider */
  }

  .list {
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  }
  li {
    font-size: 14px;
    padding: 8px;
    margin: 6px 0;
  }

  h3 {
    font-size: 20px; /* Slightly larger heading for better readability */
  }
}

/* Media query for desktop screens (min-width: 1024px) */
@media (min-width: 1024px) {
  .projects {
    text-align: center;
    margin-top: 40px;
    margin-bottom: 5vw;
    max-width: 80%; /* Limit the width of the projects container */
    margin-left: auto;
    margin-right: auto;
  }

  .lists-container {
    flex-direction: row; /* Display lists side by side */
    justify-content: space-between;
    gap: 40px; /* Add spacing between the lists */
  }

  .add-project-btn {
    font-size: 18px;
    padding: 14px;
    margin: 20px auto;
    width: 60%; /* Make the button narrower and centered */
  }

  li {
    font-size: 16px;
    padding: 12px;
    margin: 8px 0;
    max-width: 100%; /* Ensure list items take full width of their container */
  }

  h3 {
    font-size: 22px; /* Larger heading for better readability */
  }
}
</style>
