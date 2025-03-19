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
  <div>
    <div>
      <h2>{{ heading }}</h2>

      <div>
        <form :aria-label="formLabel" @submit.prevent="$emit('submit')">
          <slot />
        </form>

        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
