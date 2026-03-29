/**
 * Proxies PATCH /api/games/:id → upstream PATCH /games/:id
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const base = config.tournamentUpstreamUrl;

  if (!base) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Service unavailable',
      message: 'Tournament upstream not configured',
    });
  }

  const id = getRouterParam(event, 'id');
  if (!id?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad request',
      message: 'Game id is required',
    });
  }

  let body: unknown;
  try {
    body = await readBody(event);
  } catch {
    body = undefined;
  }

  if (body === undefined || body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad request',
      message: 'Body must be a JSON object',
    });
  }

  const pathId = encodeURIComponent(id);

  try {
    return await $fetch<unknown>(`${base}/games/${pathId}`, {
      method: 'PATCH',
      body,
      headers: upstreamAuthHeaders(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    throw createError({
      statusCode: 502,
      statusMessage: 'Bad gateway',
      message: `Game upstream PATCH failed: ${message}`,
    });
  }
});
