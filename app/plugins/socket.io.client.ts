import { io, type Socket } from 'socket.io-client';
import { useTournamentStore } from '~/stores/tournament';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const url = config.public.socketUrl as string;
  if (!url) {
    return;
  }

  const socket: Socket = io(url);

  socket.on('games:updated', () => {
    void refreshNuxtData('tournament');
    const tournamentStore = useTournamentStore(nuxtApp.$pinia);
    void tournamentStore.resetFromServer();
  });

  socket.on('drinks:updated', () => {
    void refreshNuxtData('drinks-list');
  });

  nuxtApp.hook('app:unmounted', () => {
    socket.disconnect();
  });
});
