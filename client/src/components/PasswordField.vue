<script setup lang="ts">
import { computed, ref } from 'vue'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'

withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
    autocomplete?: string
    required?: boolean
    id?: string
    name?: string
    title?: string
    pattern?: string
    dataTestid?: string
  }>(),
  {
    placeholder: 'password',
    autocomplete: 'current-password',
    required: false,
    id: undefined,
    name: undefined,
    title: undefined,
    pattern: undefined,
    dataTestid: undefined,
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isVisible = ref(false)
const inputType = computed(() => (isVisible.value ? 'text' : 'password'))

function onInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

function toggleVisibility() {
  isVisible.value = !isVisible.value
}
</script>

<template>
  <div class="passwordField">
    <input
      :value="modelValue"
      :type="inputType"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :required="required"
      :id="id"
      :name="name"
      :title="title"
      :pattern="pattern"
      :data-testid="dataTestid"
      @input="onInput"
    />
    <button
      type="button"
      class="toggleBtn"
      :aria-label="isVisible ? 'Hide password' : 'Show password'"
      :aria-pressed="isVisible"
      @click="toggleVisibility"
    >
      <EyeSlashIcon v-if="isVisible" class="icon" />
      <EyeIcon v-else class="icon" />
    </button>
  </div>
</template>

<style scoped>
.passwordField {
  position: relative;
  width: 100%;
}

.passwordField input {
  width: 100%;
  box-sizing: border-box;
  padding-right: 56px;
}

.toggleBtn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--text-green);
  cursor: pointer;
}

.icon {
  width: 20px;
  height: 20px;
}
</style>
