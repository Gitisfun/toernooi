import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE, adminSessionCookieOptions } from '../utils/admin-auth-cookie';

export default defineEventHandler(async (event) => {
  const { adminUsername, adminPassword } = useRuntimeConfig(event);
  const body = (await readBody<{ username?: string; password?: string }>(event).catch(() => ({}))) as {
    username?: string;
    password?: string;
  };

  if (adminUsername && adminPassword && body.username === adminUsername && body.password === adminPassword) {
    setCookie(event, ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE, adminSessionCookieOptions());
    return { ok: true as const };
  }

  throw createError({
    statusCode: 401,
    statusMessage: 'Ongeldige gebruikersnaam of wachtwoord',
  });
});
