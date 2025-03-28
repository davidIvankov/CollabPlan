<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import PageForm from '@/components/PageForm.vue'
import { useRoute, useRouter } from 'vue-router'
import useErrorMessage from '@/composables/useErrorMessage'
import { createProject, getProjectById, removeProject, updateProject } from '@/stores/project'

const router = useRouter()
const route = useRoute()
const oldProject = ref()

const project = ref({
  name: '',
  description: '',
})

const projectId = route.params.id as string
const isUpdateRoute = computed(() => route.path.includes('update'))
onMounted(async () => {
  if (projectId) {
    oldProject.value = await getProjectById(projectId)
    project.value = { name: oldProject.value?.name, description: oldProject.value?.description }
  }
})
const [deleteProject, deletionError] = useErrorMessage(async () => {
  if (!confirm('Are you shore you want to delete this project?')) return

  await removeProject(projectId)
  router.push('/dashboard/profile')
})
const [submitProject, errorMessage] = useErrorMessage(async () => {
  let newProject
  if (isUpdateRoute.value) {
    if (!confirm('Are you shore you want to update this project?')) return
    newProject = await updateProject({
      id: projectId,
      name: project.value.name,
      description: project.value.description,
    })
  } else {
    newProject = await createProject(project.value)
  }
  router.push(`/dashboard/projects/${newProject?.id}/details`)
})
</script>

<template>
  <PageForm
    :heading="isUpdateRoute ? 'Update' : 'New Project'"
    formLabel="NewProject"
    @submit="submitProject"
  >
    <template #default>
      <div class="inputs">
        <input placeholder="name" type="text" v-model="project.name" :required="true" />

        <textarea
          v-model="project.description"
          placeholder="Enter project description..."
          rows="5"
          class="textarea"
          :required="true"
        ></textarea>
      </div>

      <p v-if="errorMessage" data-testid="errorMessage" type="danger">
        {{ errorMessage }}
      </p>
      <p v-if="deletionError" data-testid="errorMessage" type="danger">
        {{ deletionError }}
      </p>

      <button type="submit" class="btn">{{ isUpdateRoute ? 'Update' : 'Create' }}</button>
      <button type="button" @click="deleteProject" class="btn danger" v-if="isUpdateRoute">
        Delete
      </button>
    </template>
  </PageForm>
</template>

<style scoped>
.danger {
  background-color: red;
}
.inputs {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4vw;
  margin-bottom: 8vw;
}
button {
  width: 100%;
  margin: auto;
}

.footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-self: flex-end;
}
.footer p {
  color: var(--text-green);
  font-weight: 700;
}
</style>
