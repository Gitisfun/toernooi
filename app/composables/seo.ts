/** Absolute URL voor canonical / Open Graph; leeg als `NUXT_PUBLIC_SITE_URL` niet gezet is. */
export function useAbsoluteSiteUrl(path: string) {
  const config = useRuntimeConfig();
  const base = String(config.public.siteUrl ?? '').replace(/\/$/, '');
  if (!base) return '';
  const p = path.startsWith('/') ? path : `/${path}`;
  if (p === '/') return `${base}/`;
  return `${base}${p}`;
}
