import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', () => {
  const loggedIn = ref(false);

  function syncFromServer(authenticated: boolean) {
    loggedIn.value = authenticated;
  }

  async function fetchSession() {
    const { authenticated } = await $fetch<{ authenticated: boolean }>('/api/auth');
    loggedIn.value = authenticated;
  }

  async function login(username: string, password: string) {
    await $fetch('/api/login', {
      method: 'POST',
      body: { username, password },
    });
    loggedIn.value = true;
  }

  async function logout() {
    await $fetch('/api/logout', { method: 'POST' });
    loggedIn.value = false;
  }

  return {
    loggedIn,
    syncFromServer,
    fetchSession,
    login,
    logout,
  };
});
