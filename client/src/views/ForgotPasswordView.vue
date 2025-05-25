<script setup lang="ts">
import { ref } from 'vue'
import PageForm from '@/components/PageForm.vue'
import { sendResetEmail } from '@/stores/user'

const email = ref('')
const submitted = ref(false)
const error = ref('')

async function submitForgotPassword() {
  error.value = ''
  submitted.value = false
  const { success } = await sendResetEmail(email.value)
  submitted.value = success
}
</script>

<template>
  <PageForm heading="Forgot Password" formLabel="ForgotPassword" @submit="submitForgotPassword">
    <template #default>
      <div class="inputs">
        <input
          type="email"
          v-model="email"
          placeholder="Enter your email address"
          autocomplete="email"
          required
        />
      </div>
      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="submitted" class="success" data-testid="emailSentSuccess">
        If this email exists, a reset link has been sent. Please check your inbox.
      </p>
      <button v-if="!submitted" type="submit" class="btn">Send reset link</button>
    </template>
  </PageForm>
</template>

<style scoped>
.inputs {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4vw;
  margin-bottom: 8vw;
}
.error {
  color: #c0392b;
  margin-bottom: 8px;
}
.success {
  color: #27ae60;
  margin-bottom: 8px;
}
</style>
