<script setup lang="ts">
import { ref, watch, watchEffect } from 'vue'
import PasswordField from '@/components/PasswordField.vue'

const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')

defineProps<{
  modelValue: string
  name?: string
  dataTestid?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'error-change', value: string): void
}>()

watch([password, confirmPassword], () => {
  if (password.value.length < 8) {
    errorMessage.value = 'Password must be at least 8 characters long'
  } else if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match'
  } else {
    errorMessage.value = ''
  }

  emit('error-change', errorMessage.value)
})

watch(password, (val) => {
  emit('update:modelValue', val)
})
</script>

<template>
  <PasswordField
    data-testid="password"
    placeholder="password"
    id="password"
    name="password"
    autocomplete="new-password"
    pattern="^.{8,}$"
    title="Password must be at least 8 characters long"
    v-model="password"
    :required="true"
  />
  <PasswordField
    data-testid="confirmPassword"
    placeholder="confirm password"
    id="confirm-password"
    name="confirm-password"
    autocomplete="new-password"
    title="Must match password"
    :required="true"
    v-model="confirmPassword"
  />
</template>
