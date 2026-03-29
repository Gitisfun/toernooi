export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuthStore();
  const reqFetch = useRequestFetch();

  const res = await reqFetch<{ authenticated: boolean }>('/api/auth').catch(() => ({ authenticated: false }));
  auth.syncFromServer(res.authenticated);

  if (!auth.loggedIn) {
    return navigateTo('/login');
  }
});
