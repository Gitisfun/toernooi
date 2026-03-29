import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE } from '../utils/admin-auth-cookie';

export default defineEventHandler((event) => {
  const token = getCookie(event, ADMIN_SESSION_COOKIE);
  return { authenticated: token === ADMIN_SESSION_VALUE };
});
