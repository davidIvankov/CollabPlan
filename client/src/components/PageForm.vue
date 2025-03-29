import { RouterLink } from 'vue-router';
<script lang="ts" setup>
defineProps<{
  heading: string
  formLabel: string
}>()

defineEmits<{
  submit: []
}>()
</script>

<template>
  <div class="container">
    <button @click="$router.go(-1)">
      <img src="@/assets/icons/arrow-left.svg" alt="go back" class="svg" />
    </button>
    <div class="formContainer">
      <h2>{{ heading }}</h2>

      <div>
        <form :aria-label="formLabel" @submit.prevent="$emit('submit')" class="form">
          <slot />
        </form>

        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  margin-top: 24px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
p .formContainer {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8vw;
}

.form {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  height: 50vh;
}

.formContainer > div {
  display: flex;
  flex-direction: column;
  width: 100%;
}

h2 {
  font-size: var(--mobile-title);
  margin-left: 0;
}

@media (min-width: 1024px) {
  .formContainer {
    width: 60%; /* Make the form narrower */
    margin: 0 auto; /* Center the form horizontally */
    gap: 2vw; /* Reduce the gap for a more compact layout */
  }

  .form {
    height: auto; /* Allow the form to adjust its height dynamically */
    padding: 20px; /* Add padding for better spacing */
  }

  h2 {
    font-size: var(--desktop-title); /* Use a larger font size for desktop */
    text-align: center; /* Center the heading */
  }
}
</style>
