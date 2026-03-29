export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const base = config.tournamentUpstreamUrl;

  if (!base) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Service unavailable',
      message: 'Teams upstream not configured',
    });
  }

  const body = await readBody<unknown>(event);
  if (!Array.isArray(body)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad request',
      message: 'Body must be a JSON array of teams',
    });
  }

  try {
    return await $fetch<unknown>(`${base}/teams`, {
      method: 'POST',
      body,
      headers: upstreamAuthHeaders(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    throw createError({
      statusCode: 502,
      statusMessage: 'Bad gateway',
      message: `Teams upstream request failed: ${message}`,
    });
  }
});
