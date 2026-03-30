function escapeXml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event);
  const base = String(config.public.siteUrl ?? '').replace(/\/$/, '');

  setHeader(event, 'content-type', 'application/xml; charset=utf-8');
  setHeader(event, 'cache-control', 'public, max-age=3600');

  if (!base) {
    return '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>';
  }

  const loc = escapeXml(`${base}/`);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${loc}</loc>
    <changefreq>hourly</changefreq>
    <priority>1</priority>
  </url>
</urlset>
`;
});
