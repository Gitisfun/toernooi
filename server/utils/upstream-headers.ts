/** Headers for BFF → external tournament API (`NUXT_TOURNAMENT_API_BASE_URL`). */
export function upstreamAuthHeaders(): Record<string, string> {
  const config = useRuntimeConfig();
  const key = config.apiKey;
  if (key === undefined || key === null || String(key).trim() === '') {
    return {};
  }
  return { 'x-api-key': String(key) };
}
