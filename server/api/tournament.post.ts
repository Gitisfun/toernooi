export default defineEventHandler(async () => {
  const config = useRuntimeConfig();
  const upstream = config.tournamentUpstreamUrl;

  if (!upstream) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Service unavailable',
      message: 'Tournament upstream not configured',
    });
  }

  try {
    return await $fetch<unknown>(`${upstream}/tournament`, {
      method: 'POST',
      headers: upstreamAuthHeaders(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    throw createError({
      statusCode: 502,
      statusMessage: 'Bad gateway',
      message: `Tournament upstream POST failed: ${message}`,
    });
  }
});
