export default defineEventHandler(async () => {
  const config = useRuntimeConfig();
  const base = config.tournamentUpstreamUrl;

  if (!base) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Service unavailable',
      message: 'Drinks upstream not configured',
    });
  }

  try {
    return await $fetch<unknown>(`${base}/drinks`, {
      method: 'POST',
      headers: upstreamAuthHeaders(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    throw createError({
      statusCode: 502,
      statusMessage: 'Bad gateway',
      message: `Drinks upstream POST failed: ${message}`,
    });
  }
});
