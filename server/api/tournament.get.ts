import tournamentMock from '../data/tournament-mock.json';

export default defineEventHandler(async () => {
  const config = useRuntimeConfig();
  const upstream = config.tournamentUpstreamUrl;

  if (upstream) {
    try {
      return await $fetch<typeof tournamentMock>(`${upstream}/tournament`, {
        headers: upstreamAuthHeaders(),
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      throw createError({
        statusCode: 502,
        statusMessage: 'Bad gateway',
        message: `Tournament upstream request failed: ${message}`,
      });
    }
  }

  return tournamentMock;
});
