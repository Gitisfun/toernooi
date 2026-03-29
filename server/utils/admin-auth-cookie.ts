/** HttpOnly session flag for admin UI (set by POST /api/login). */
export const ADMIN_SESSION_COOKIE = 'tournament_admin_session';

export const ADMIN_SESSION_VALUE = '1';

export function adminSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7,
  };
}
