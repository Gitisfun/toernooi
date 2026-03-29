import type { TournamentTeam } from '~/types/tournament';

export default defineEventHandler(async () => {
  const config = useRuntimeConfig();
  const base = config.tournamentUpstreamUrl;

  if (!base) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Service unavailable',
      message: 'Teams upstream not configured',
    });
  }

  try {
    return await $fetch<TournamentTeam[]>(`${base}/teams`, {
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
