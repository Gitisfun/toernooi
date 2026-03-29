import { ADMIN_SESSION_COOKIE } from '../utils/admin-auth-cookie';

export default defineEventHandler((event) => {
  deleteCookie(event, ADMIN_SESSION_COOKIE, { path: '/' });
  return { ok: true as const };
});
