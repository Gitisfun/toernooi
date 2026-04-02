<template>
  <div class="admin-page">
    <header class="admin-top">
      <NuxtLink to="/" class="admin-back">← Naar speelschema</NuxtLink>
      <h1 class="admin-title">Beheer toernooi</h1>
      <div class="admin-top-actions">
        <button type="button" class="btn-toolbar" :disabled="resetting" @click="onReset">
          {{ resetting ? 'Bezig…' : 'Herlaad van server' }}
        </button>
        <button type="button" class="btn-toolbar" @click="onLogout">Afmelden</button>
      </div>
    </header>

    <div v-if="showLoading" class="admin-loading" role="status">Laden…</div>
    <template v-else-if="tournamentStore.draft">
      <nav class="admin-tabs" aria-label="Beheer-tabs">
        <button type="button" class="admin-tab" :class="{ 'admin-tab--active': tab === 'group1' }" :aria-selected="tab === 'group1'" @click="tab = 'group1'">Groep 1</button>
        <button v-if="hasSecondPoule" type="button" class="admin-tab" :class="{ 'admin-tab--active': tab === 'group2' }" :aria-selected="tab === 'group2'" @click="tab = 'group2'">Groep 2</button>
        <button type="button" class="admin-tab" :class="{ 'admin-tab--active': tab === 'knockout' }" :aria-selected="tab === 'knockout'" @click="tab = 'knockout'">Knockout</button>
        <button type="button" class="admin-tab" :class="{ 'admin-tab--active': tab === 'teams' }" :aria-selected="tab === 'teams'" @click="tab = 'teams'">Teams</button>
        <button type="button" class="admin-tab" :class="{ 'admin-tab--active': tab === 'drinks' }" :aria-selected="tab === 'drinks'" @click="tab = 'drinks'">Zuipbeker</button>
        <button type="button" class="admin-tab" :class="{ 'admin-tab--active': tab === 'settings' }" :aria-selected="tab === 'settings'" @click="tab = 'settings'">Instellingen</button>
      </nav>

      <div v-if="isScheduleTab(tab)" class="admin-panel">
        <AdminSpeelschemaTab :section="tab" />
      </div>
      <div v-show="tab === 'teams'" class="admin-panel">
        <AdminTeamsTab :active="tab === 'teams'" />
      </div>
      <div v-show="tab === 'drinks'" class="admin-panel">
        <DrinksPanel admin-layout />
      </div>
      <div v-show="tab === 'settings'" class="admin-panel">
        <AdminInstellingenTab />
      </div>
    </template>
    <p v-else class="admin-error" role="alert">Geen toernooigegevens geladen.</p>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { useTournamentStore } from '~/stores/tournament';
import { useTeamsStore } from '~/stores/teams';

definePageMeta({
  middleware: 'admin-auth',
});

useSeoMeta({
  title: 'Beheer toernooi',
  description: 'Intern beheerpaneel voor het tornooi Sporting Oppem.',
  robots: 'noindex, nofollow',
});

const authStore = useAuthStore();
const tournamentStore = useTournamentStore();
const teamsStore = useTeamsStore();

const tab = ref<'group1' | 'group2' | 'knockout' | 'teams' | 'settings' | 'drinks'>('group1');
const resetting = ref(false);

const hasSecondPoule = computed(() => tournamentStore.groupKeysSorted.length >= 2);

function isScheduleTab(t: (typeof tab)['value']): t is 'group1' | 'group2' | 'knockout' {
  return t === 'group1' || t === 'group2' || t === 'knockout';
}

watch(hasSecondPoule, (ok) => {
  if (!ok && tab.value === 'group2') {
    tab.value = 'group1';
  }
});

const showLoading = computed(() => !tournamentStore.initialized || (tournamentStore.fetchStatus === 'pending' && !tournamentStore.draft));

onMounted(async () => {
  tournamentStore.initClient();
  await Promise.all([tournamentStore.fetchRemote(), teamsStore.loadTeams()]);
});

async function onReset() {
  resetting.value = true;
  try {
    await tournamentStore.resetFromServer();
    await teamsStore.loadTeams();
  } finally {
    resetting.value = false;
  }
}

async function onLogout() {
  await authStore.logout();
  await navigateTo('/login');
}
</script>

<style scoped>
.admin-page {
  flex: 1;
  width: 100%;
  padding: 20px var(--layout-pad) 48px;
  max-width: 960px;
  margin: 0 auto;
  box-sizing: border-box;
}

.admin-top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--color-forest);
}

.admin-back {
  font-weight: 600;
  color: var(--color-forest);
  text-decoration: none;
}

.admin-back:hover {
  text-decoration: underline;
}

.admin-title {
  flex: 1;
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-forest-dark);
}

.admin-top-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.btn-toolbar {
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background: #fff;
  font-weight: 600;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
}

.btn-toolbar:hover:not(:disabled) {
  border-color: var(--color-forest);
  color: var(--color-forest);
}

.btn-toolbar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.admin-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

.admin-tab {
  padding: 10px 20px;
  border: none;
  border-radius: 999px;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  background: #e5e7eb;
  color: #4b5563;
}

.admin-tab:hover {
  background: #d1d5db;
}

.admin-tab--active {
  background: var(--color-yellow);
  color: var(--color-forest-dark);
}

.admin-panel {
  animation: fade-in 0.2s ease;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.admin-loading,
.admin-error {
  padding: 32px;
  text-align: center;
  font-weight: 600;
  color: #4b5563;
}

.admin-error {
  color: #b91c1c;
}
</style>
