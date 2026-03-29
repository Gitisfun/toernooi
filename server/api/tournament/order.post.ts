/**
 * Proxies POST /api/tournament/order → upstream POST /tournament/order
 * Body: { groups: { [groupKey]: string[] } } (match ids in display order per group)
 */
function isValidOrderBody(body: unknown): body is { groups: Record<string, string[]> } {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return false;
  }
  const groups = (body as { groups?: unknown }).groups;
  if (groups === null || typeof groups !== 'object' || Array.isArray(groups)) {
    return false;
  }
  for (const value of Object.values(groups)) {
    if (!Array.isArray(value)) {
      return false;
    }
    if (!value.every((x) => typeof x === 'string')) {
      return false;
    }
  }
  return true;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const upstream = config.tournamentUpstreamUrl;

  if (!upstream) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Service unavailable',
      message: 'Tournament upstream not configured',
    });
  }

  let body: unknown;
  try {
    body = await readBody(event);
  } catch {
    body = undefined;
  }

  if (!isValidOrderBody(body)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad request',
      message: 'Body must be { groups: { [key]: string[] } } with match id strings per group',
    });
  }

  try {
    return await $fetch<unknown>(`${upstream}/tournament/order`, {
      method: 'POST',
      body,
      headers: upstreamAuthHeaders(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    throw createError({
      statusCode: 502,
      statusMessage: 'Bad gateway',
      message: `Tournament order upstream POST failed: ${message}`,
    });
  }
});
