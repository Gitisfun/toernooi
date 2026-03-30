function escapeRobotsLine(s: string) {
  return s.replace(/\n/g, ' ');
}

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event);
  const base = String(config.public.siteUrl ?? '').replace(/\/$/, '');

  setHeader(event, 'content-type', 'text/plain; charset=utf-8');
  setHeader(event, 'cache-control', 'public, max-age=3600');

  const lines = ['User-agent: *', 'Allow: /', 'Disallow: /admin', 'Disallow: /api/', ''];

  if (base) {
    lines.push(`Sitemap: ${escapeRobotsLine(`${base}/sitemap.xml`)}`, '');
  }

  return lines.join('\n');
});
