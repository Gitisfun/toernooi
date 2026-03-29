<template>
  <div class="admin-settings">
    <p class="admin-settings__intro">Gevaarlijke acties: alleen gebruiken als je de data op de server echt wilt wissen.</p>

    <section v-if="!tournamentStore.needsTournamentBootstrap" class="admin-settings__section">
      <h2 class="admin-settings__title">Toernooi</h2>
      <p class="admin-settings__desc">Verwijdert het speelschema op de server (<code class="admin-settings__code">DELETE /tournaments</code> via de BFF). Daarna wordt het schema opnieuw opgehaald.</p>
      <p v-if="tournamentStore.deleteTournamentError" class="admin-settings__msg admin-settings__msg--error" role="alert">
        {{ tournamentStore.deleteTournamentError }}
      </p>
      <p v-else-if="tournamentStore.deleteTournamentOk" class="admin-settings__msg admin-settings__msg--ok" role="status">Toernooi is verwijderd; het schema is vernieuwd.</p>
      <button type="button" class="btn-danger" :disabled="tournamentStore.deleteTournamentLoading" @click="onDeleteTournament">
        {{ tournamentStore.deleteTournamentLoading ? 'Bezig…' : 'Toernooi verwijderen' }}
      </button>
    </section>
    <p v-else class="admin-settings__hint">Het speelschema is nog leeg (geen wedstrijden). Er is nog geen toernooi om te verwijderen; gebruik het tabblad Speelschema om eerst een toernooi aan te maken.</p>

    <section v-if="tournamentStore.needsTournamentBootstrap && teamsStore.items.length >= 1" class="admin-settings__section">
      <h2 class="admin-settings__title">Teams</h2>
      <p class="admin-settings__desc">Verwijdert alle teams op de server (<code class="admin-settings__code">DELETE /teams</code> via de BFF). De lijst wordt daarna opnieuw geladen. Alleen beschikbaar zolang het toernooi nog geen wedstrijden heeft en er minstens één team op de server staat.</p>
      <p v-if="teamsStore.deleteAllTeamsError" class="admin-settings__msg admin-settings__msg--error" role="alert">
        {{ teamsStore.deleteAllTeamsError }}
      </p>
      <p v-else-if="teamsStore.deleteAllTeamsOk" class="admin-settings__msg admin-settings__msg--ok" role="status">Alle teams zijn verwijderd.</p>
      <button type="button" class="btn-danger" :disabled="teamsStore.deleteAllTeamsLoading" @click="onDeleteTeams">
        {{ teamsStore.deleteAllTeamsLoading ? 'Bezig…' : 'Alle teams verwijderen' }}
      </button>
    </section>
    <p v-else-if="tournamentStore.needsTournamentBootstrap" class="admin-settings__hint">Er staan nog geen teams op de server; er is niets om te verwijderen. Voeg teams toe via het tabblad Teams.</p>
    <p v-else class="admin-settings__hint">Teams wissen is alleen mogelijk als het speelschema leeg is (geen wedstrijden in groep A en B). Verwijder eerst het toernooi hierboven als je alle teams wilt kunnen wissen.</p>

    <section v-if="drinksReady && drinksHasRows" class="admin-settings__section">
      <h2 class="admin-settings__title">Zuipbeker</h2>
      <p class="admin-settings__desc">Verwijdert alle drankregistraties op de server (<code class="admin-settings__code">DELETE /drinks</code> via de BFF). De lijst wordt daarna opnieuw geladen. Alleen beschikbaar zolang er minstens één regel in de zuipbeker-lijst staat.</p>
      <p v-if="deleteDrinksError" class="admin-settings__msg admin-settings__msg--error" role="alert">
        {{ deleteDrinksError }}
      </p>
      <p v-else-if="deleteDrinksOk" class="admin-settings__msg admin-settings__msg--ok" role="status">Alle zuipbeker-registraties zijn verwijderd.</p>
      <button type="button" class="btn-danger" :disabled="deleteDrinksLoading" @click="onDeleteDrinks">
        {{ deleteDrinksLoading ? 'Bezig…' : 'Alle dranken verwijderen' }}
      </button>
    </section>
    <p v-else-if="drinksReady && !drinksHasRows" class="admin-settings__hint">Er is nog geen zuipbeker-data op de server; er is niets om te verwijderen. Voeg een lijst toe via het tabblad Zuipbeker.</p>
    <p v-else-if="drinksError" class="admin-settings__hint admin-settings__hint--error" role="alert">Kon de zuipbeker-lijst niet laden.</p>
    <p v-else-if="drinksPending" class="admin-settings__hint" role="status">Zuipbeker-lijst laden…</p>
  </div>
</template>

<script setup lang="ts">
import type { DrinkRow } from '~/types/tournament';
import { useTournamentStore } from '~/stores/tournament';
import { useTeamsStore } from '~/stores/teams';

const tournamentStore = useTournamentStore();
const teamsStore = useTeamsStore();

const {
  data: drinksData,
  pending: drinksPending,
  error: drinksError,
  refresh: refreshDrinks,
} = useFetch<DrinkRow[]>('/api/drinks', {
  key: 'drinks-list',
});

const drinksReady = computed(() => !drinksPending.value && !drinksError.value);
const drinksHasRows = computed(() => Array.isArray(drinksData.value) && drinksData.value.length > 0);

const deleteDrinksLoading = ref(false);
const deleteDrinksError = ref<string | null>(null);
const deleteDrinksOk = ref(false);

function onDeleteTournament() {
  const ok = window.confirm('Weet je zeker dat je het toernooi (het volledige speelschema) op de server wilt verwijderen? Dit kan niet automatisch ongedaan worden gemaakt.');
  if (!ok) return;
  void tournamentStore.deleteTournamentOnServer();
}

function onDeleteTeams() {
  const ok = window.confirm('Weet je zeker dat je alle teams op de server wilt verwijderen? Dit kan niet automatisch ongedaan worden gemaakt.');
  if (!ok) return;
  void teamsStore.deleteAllTeamsOnServer();
}

async function onDeleteDrinks() {
  const ok = window.confirm('Weet je zeker dat je alle zuipbeker-registraties (alle dranktellingen per team) op de server wilt verwijderen? Dit kan niet automatisch ongedaan worden gemaakt.');
  if (!ok) return;
  deleteDrinksLoading.value = true;
  deleteDrinksError.value = null;
  deleteDrinksOk.value = false;
  try {
    await $fetch('/api/drinks', { method: 'DELETE' });
    deleteDrinksOk.value = true;
    await refreshDrinks();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Verwijderen mislukt.';
    deleteDrinksError.value = msg;
  } finally {
    deleteDrinksLoading.value = false;
  }
}
</script>

<style scoped>
.admin-settings {
  max-width: 560px;
}

.admin-settings__intro {
  margin: 0 0 24px;
  font-size: 14px;
  color: #4b5563;
  line-height: 1.5;
}

.admin-settings__section {
  margin-bottom: 28px;
  padding: 20px 22px;
  border-radius: 12px;
  border: 1px solid #fecaca;
  background: #fff;
}

.admin-settings__title {
  margin: 0 0 10px;
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-forest-dark);
}

.admin-settings__desc {
  margin: 0 0 14px;
  font-size: 14px;
  line-height: 1.55;
  color: #374151;
}

.admin-settings__code {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  background: #f3f4f6;
  color: #1f2937;
}

.admin-settings__msg {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 600;
}

.admin-settings__msg--error {
  color: #b91c1c;
}

.admin-settings__msg--ok {
  color: var(--color-forest);
}

.admin-settings__hint {
  margin: 0 0 28px;
  padding: 16px 18px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  font-size: 14px;
  line-height: 1.5;
  color: #4b5563;
  max-width: 560px;
}

.admin-settings__hint--error {
  border-color: #fecaca;
  background: #fef2f2;
  color: #991b1b;
}

.btn-danger {
  padding: 10px 18px;
  border-radius: 8px;
  border: none;
  background: #b91c1c;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
}

.btn-danger:hover:not(:disabled) {
  background: #991b1b;
}

.btn-danger:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
</style>
