<template>
  <div class="login-page">
    <div class="login-card">
      <h1 class="login-title">Beheer — inloggen</h1>
      <p class="login-lead">Log in om het toernooi te beheren.</p>

      <form class="login-form" @submit.prevent="onSubmit">
        <label class="login-field">
          <span class="login-label">Gebruikersnaam</span>
          <input v-model.trim="username" type="text" name="username" autocomplete="username" class="login-input" required />
        </label>
        <label class="login-field">
          <span class="login-label">Wachtwoord</span>
          <input
            v-model="password"
            type="password"
            name="password"
            autocomplete="current-password"
            class="login-input"
            required
          />
        </label>
        <p v-if="errorMessage" class="login-error" role="alert">{{ errorMessage }}</p>
        <button type="submit" class="login-submit" :disabled="loading">
          {{ loading ? 'Bezig…' : 'Inloggen' }}
        </button>
      </form>

      <NuxtLink to="/" class="login-back">← Terug naar speelschema</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'login-redirect',
});

const authStore = useAuthStore();
const username = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');

async function onSubmit() {
  errorMessage.value = '';
  loading.value = true;
  try {
    await authStore.login(username.value, password.value);
    await navigateTo('/admin');
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }; statusMessage?: string };
    errorMessage.value =
      err?.data?.message ?? err?.statusMessage ?? 'Inloggen mislukt. Controleer je gegevens.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px var(--layout-pad);
  background: var(--color-page-bg);
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 28px 28px 24px;
  background: var(--color-card);
  border-radius: 14px;
  box-shadow: 0 8px 32px rgba(15, 51, 31, 0.1);
  border: 1px solid rgba(26, 77, 46, 0.1);
}

.login-title {
  margin: 0 0 8px;
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-forest-dark);
}

.login-lead {
  margin: 0 0 24px;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.45;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.login-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.login-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.login-input {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 15px;
  color: #1f2937;
}

.login-input:focus {
  outline: none;
  border-color: var(--color-forest);
  box-shadow: 0 0 0 2px rgba(26, 77, 46, 0.15);
}

.login-error {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #b91c1c;
}

.login-submit {
  margin-top: 4px;
  padding: 12px 20px;
  border: none;
  border-radius: 999px;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  background: var(--color-yellow);
  color: var(--color-forest-dark);
  transition: background 0.15s ease;
}

.login-submit:hover:not(:disabled) {
  background: var(--color-yellow-bright);
}

.login-submit:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.login-back {
  display: inline-block;
  margin-top: 20px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-forest);
  text-decoration: none;
}

.login-back:hover {
  text-decoration: underline;
}
</style>
