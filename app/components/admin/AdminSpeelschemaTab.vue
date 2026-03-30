<template>
  <div class="admin-schedule">
    <template v-if="teamsStore.loading">
      <p class="admin-schedule__notice" role="status">Teams laden…</p>
    </template>
    <template v-else-if="teamsStore.loadError">
      <p class="admin-schedule__notice admin-schedule__notice--error" role="alert">{{ teamsStore.loadError }}</p>
    </template>
    <template v-else-if="!hasEnoughTeams">
      <p class="admin-schedule__notice" role="status">
        Om dit speelschema te kunnen tonen en beheren heb je <strong>10 teams</strong> nodig op de server. Er zijn er nu {{ teamCountFromApi }}. <strong>Voeg eerst 10 teams toe</strong> op het tabblad <strong>Teams</strong>; daarna verschijnt het schema in de tabs <strong>Groep 1</strong>,
        <strong>Groep 2</strong> en <strong>Knockout</strong>.
      </p>
    </template>
    <template v-else-if="tournamentStore.needsTournamentBootstrap">
      <div class="admin-schedule__bootstrap">
        <p class="admin-schedule__bootstrap-text">Er is nog geen speelschema. Zorg dat er 10 teams op de server staan, maak het toernooi vervolgens aan op de server; daarna wordt de pagina opnieuw geladen.</p>
        <p v-if="tournamentStore.createTournamentError" class="admin-schedule__bootstrap-error" role="alert">
          {{ tournamentStore.createTournamentError }}
        </p>
        <button type="button" class="admin-schedule__bootstrap-btn" :disabled="tournamentStore.createTournamentLoading" @click="tournamentStore.createTournamentOnServer()">
          {{ tournamentStore.createTournamentLoading ? 'Bezig…' : 'Toernooi aanmaken' }}
        </button>
      </div>
    </template>
    <template v-else>
      <p v-if="section === 'group1' || section === 'group2'" class="admin-schedule__hint">Sleep wedstrijden met het grip-icoon om de volgorde te wijzigen. Klik op het potlood om scores en tijden te bewerken.</p>
      <p v-if="section === 'knockout'" class="admin-schedule__hint admin-schedule__hint--knockout-tab">Knockoutfase: de volgorde komt van de server. Je kunt hier wél tijden en scores aanpassen.</p>
      <p v-if="tournamentStore.gamePatchError" class="admin-schedule__notice admin-schedule__notice--error admin-schedule__patch-error" role="alert">
        {{ tournamentStore.gamePatchError }}
      </p>
      <p v-if="(section === 'group1' || section === 'group2') && tournamentStore.orderPersistError" class="admin-schedule__notice admin-schedule__notice--error admin-schedule__patch-error" role="alert">
        {{ tournamentStore.orderPersistError }}
      </p>

      <template v-if="section === 'knockout'">
        <section v-for="block in knockoutAdminSections" :key="block.title" class="admin-group">
          <h2 class="admin-group__title">{{ block.title }}</h2>
          <div class="admin-table-wrap">
            <table class="admin-table admin-table--matches admin-table--matches-knockout">
              <colgroup>
                <col class="admin-table__col-time" />
                <col class="admin-table__col-team" />
                <col class="admin-table__col-score" />
                <col class="admin-table__col-team" />
                <col class="admin-table__col-actions" />
              </colgroup>
              <thead>
                <tr>
                  <th>Tijd</th>
                  <th>Thuis</th>
                  <th>Score</th>
                  <th>Uit</th>
                  <th class="admin-table__col-actions" />
                </tr>
              </thead>
              <tbody>
                <tr v-for="match in block.matches" :key="match.id" class="admin-table__row" :class="{ 'admin-table__row--editing': editingId === match.id }">
                  <template v-if="editingId !== match.id">
                    <td>{{ match.startHour }} – {{ match.endHour }}</td>
                    <td :class="{ 'admin-table__td-tbd': !match.homeTeam }">{{ matchSideLabel(match.homeTeam) }}</td>
                    <td class="admin-table__scores">
                      <span class="score-pill">{{ scoreStr(match.homeTeamScore) }}</span>
                      <span class="score-sep">-</span>
                      <span class="score-pill">{{ scoreStr(match.awayTeamScore) }}</span>
                      <span v-if="hasPenalties(match)" class="pen-row"> ({{ scoreStr(match.penaltyHomeTeamScore) }}-{{ scoreStr(match.penaltyAwayTeamScore) }}) </span>
                      <span v-if="matchTerrainLine(match)" class="match-meta-row">{{ matchTerrainLine(match) }}</span>
                      <span v-if="matchDescriptionLine(match)" class="match-meta-row">{{ matchDescriptionLine(match) }}</span>
                    </td>
                    <td :class="{ 'admin-table__td-tbd': !match.awayTeam }">{{ matchSideLabel(match.awayTeam) }}</td>
                    <td class="admin-table__actions">
                      <button type="button" class="icon-btn" title="Bewerken" aria-label="Bewerken" @click="startEdit(match)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    </td>
                  </template>
                  <template v-else>
                    <td colspan="5" class="admin-table__edit-cell">
                      <div class="edit-teams-readonly">
                        <p class="edit-teams-line">
                          <span class="edit-teams-label">Thuis</span>
                          <span :class="{ 'edit-teams-tbd': !match.homeTeam }">{{ matchSideLabel(match.homeTeam) }}</span>
                        </p>
                        <p class="edit-teams-line">
                          <span class="edit-teams-label">Uit</span>
                          <span :class="{ 'edit-teams-tbd': !match.awayTeam }">{{ matchSideLabel(match.awayTeam) }}</span>
                        </p>
                      </div>
                      <div class="edit-grid">
                        <label class="edit-field">
                          <span>Start</span>
                          <input v-model="editForm.startHour" type="text" class="edit-input" placeholder="10:00" />
                        </label>
                        <label class="edit-field">
                          <span>Einde</span>
                          <input v-model="editForm.endHour" type="text" class="edit-input" placeholder="10:20" />
                        </label>
                        <label class="edit-field">
                          <span>Score thuis</span>
                          <input v-model="editForm.homeTeamScore" type="text" inputmode="numeric" class="edit-input" placeholder="-" />
                        </label>
                        <label class="edit-field">
                          <span>Score uit</span>
                          <input v-model="editForm.awayTeamScore" type="text" inputmode="numeric" class="edit-input" placeholder="-" />
                        </label>
                        <label class="edit-field">
                          <span>Pen thuis</span>
                          <input v-model="editForm.penaltyHomeTeamScore" type="text" inputmode="numeric" class="edit-input" placeholder="-" />
                        </label>
                        <label class="edit-field">
                          <span>Pen uit</span>
                          <input v-model="editForm.penaltyAwayTeamScore" type="text" inputmode="numeric" class="edit-input" placeholder="-" />
                        </label>
                        <label class="edit-field edit-field--full">
                          <span>Terrein</span>
                          <input v-model="editForm.terrain" type="text" class="edit-input" placeholder="Optioneel" autocomplete="off" />
                        </label>
                        <label class="edit-field edit-field--full">
                          <span>Beschrijving</span>
                          <textarea v-model="editForm.description" class="edit-input edit-textarea" rows="3" placeholder="Optioneel" />
                        </label>
                      </div>
                      <div class="edit-actions">
                        <button type="button" class="btn btn--primary" :disabled="tournamentStore.gamePatchLoading" @click="saveEdit(match.id)">
                          {{ tournamentStore.gamePatchLoading ? 'Opslaan…' : 'Opslaan' }}
                        </button>
                        <button type="button" class="btn btn--ghost" :disabled="tournamentStore.gamePatchLoading" @click="cancelEdit">Annuleren</button>
                      </div>
                    </td>
                  </template>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <p v-if="!knockoutAdminSections.length" class="admin-schedule__notice admin-schedule__notice--muted" role="status">Nog geen knockoutwedstrijden in het schema.</p>
      </template>

      <template v-else-if="groupKeyForSection">
        <section class="admin-group">
          <h2 class="admin-group__title">{{ groupSectionHeading }}</h2>
          <div class="admin-table-wrap">
            <table class="admin-table admin-table--matches admin-table--matches-group">
              <colgroup>
                <col class="admin-table__col-grip-col" />
                <col class="admin-table__col-time" />
                <col class="admin-table__col-team" />
                <col class="admin-table__col-score" />
                <col class="admin-table__col-team" />
                <col class="admin-table__col-actions" />
              </colgroup>
              <thead>
                <tr>
                  <th class="admin-table__col-grip" aria-hidden="true" />
                  <th>Tijd</th>
                  <th>Thuis</th>
                  <th>Score</th>
                  <th>Uit</th>
                  <th class="admin-table__col-actions" />
                </tr>
              </thead>
              <tbody>
                <tr v-for="(match, index) in tournamentStore.matchesForGroupSorted(groupKeyForSection)" :key="match.id" class="admin-table__row" :class="{ 'admin-table__row--editing': editingId === match.id }" @dragover.prevent="onDragOver" @drop.prevent="onDrop(groupKeyForSection, index)">
                  <td class="admin-table__cell-grip">
                    <span class="drag-handle" draggable="true" title="Sleep om te herschikken" aria-label="Sleep om te herschikken" @dragstart="onDragStart($event, groupKeyForSection, index)" @dragend="onDragEnd">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm6-12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
                      </svg>
                    </span>
                  </td>
                  <template v-if="editingId !== match.id">
                    <td>{{ match.startHour }} – {{ match.endHour }}</td>
                    <td :class="{ 'admin-table__td-tbd': !match.homeTeam }">{{ matchSideLabel(match.homeTeam) }}</td>
                    <td class="admin-table__scores">
                      <span class="score-pill">{{ scoreStr(match.homeTeamScore) }}</span>
                      <span class="score-sep">-</span>
                      <span class="score-pill">{{ scoreStr(match.awayTeamScore) }}</span>
                      <span v-if="hasPenalties(match)" class="pen-row"> ({{ scoreStr(match.penaltyHomeTeamScore) }}-{{ scoreStr(match.penaltyAwayTeamScore) }}) </span>
                      <span v-if="matchTerrainLine(match)" class="match-meta-row">{{ matchTerrainLine(match) }}</span>
                      <span v-if="matchDescriptionLine(match)" class="match-meta-row">{{ matchDescriptionLine(match) }}</span>
                    </td>
                    <td :class="{ 'admin-table__td-tbd': !match.awayTeam }">{{ matchSideLabel(match.awayTeam) }}</td>
                    <td class="admin-table__actions">
                      <button type="button" class="icon-btn" title="Bewerken" aria-label="Bewerken" @click="startEdit(match)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    </td>
                  </template>
                  <template v-else>
                    <td colspan="5" class="admin-table__edit-cell">
                      <div class="edit-teams-readonly">
                        <p class="edit-teams-line">
                          <span class="edit-teams-label">Thuis</span>
                          <span :class="{ 'edit-teams-tbd': !match.homeTeam }">{{ matchSideLabel(match.homeTeam) }}</span>
                        </p>
                        <p class="edit-teams-line">
                          <span class="edit-teams-label">Uit</span>
                          <span :class="{ 'edit-teams-tbd': !match.awayTeam }">{{ matchSideLabel(match.awayTeam) }}</span>
                        </p>
                      </div>
                      <div class="edit-grid">
                        <label class="edit-field">
                          <span>Start</span>
                          <input v-model="editForm.startHour" type="text" class="edit-input" placeholder="10:00" />
                        </label>
                        <label class="edit-field">
                          <span>Einde</span>
                          <input v-model="editForm.endHour" type="text" class="edit-input" placeholder="10:20" />
                        </label>
                        <label class="edit-field">
                          <span>Score thuis</span>
                          <input v-model="editForm.homeTeamScore" type="text" inputmode="numeric" class="edit-input" placeholder="-" />
                        </label>
                        <label class="edit-field">
                          <span>Score uit</span>
                          <input v-model="editForm.awayTeamScore" type="text" inputmode="numeric" class="edit-input" placeholder="-" />
                        </label>
                        <label class="edit-field">
                          <span>Pen thuis</span>
                          <input v-model="editForm.penaltyHomeTeamScore" type="text" inputmode="numeric" class="edit-input" placeholder="-" />
                        </label>
                        <label class="edit-field">
                          <span>Pen uit</span>
                          <input v-model="editForm.penaltyAwayTeamScore" type="text" inputmode="numeric" class="edit-input" placeholder="-" />
                        </label>
                        <label class="edit-field edit-field--full">
                          <span>Terrein</span>
                          <input v-model="editForm.terrain" type="text" class="edit-input" placeholder="Optioneel" autocomplete="off" />
                        </label>
                        <label class="edit-field edit-field--full">
                          <span>Beschrijving</span>
                          <textarea v-model="editForm.description" class="edit-input edit-textarea" rows="3" placeholder="Optioneel" />
                        </label>
                      </div>
                      <div class="edit-actions">
                        <button type="button" class="btn btn--primary" :disabled="tournamentStore.gamePatchLoading" @click="saveEdit(match.id)">
                          {{ tournamentStore.gamePatchLoading ? 'Opslaan…' : 'Opslaan' }}
                        </button>
                        <button type="button" class="btn btn--ghost" :disabled="tournamentStore.gamePatchLoading" @click="cancelEdit">Annuleren</button>
                      </div>
                    </td>
                  </template>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section v-if="standingsRowsForActivePoule.length" class="admin-group">
          <h2 class="admin-group__title">{{ standTitleForSection }}</h2>
          <div class="admin-table-wrap admin-table-wrap--standings">
            <table class="admin-table admin-table--standings">
              <thead>
                <tr>
                  <th class="admin-table__th-narrow">#</th>
                  <th>Team</th>
                  <th class="admin-table__th-narrow">Wed</th>
                  <th class="admin-table__th-narrow admin-table__col--hide-mobile">W</th>
                  <th class="admin-table__th-narrow admin-table__col--hide-mobile">G</th>
                  <th class="admin-table__th-narrow admin-table__col--hide-mobile">V</th>
                  <th class="admin-table__th-narrow admin-table__th-pts">P</th>
                  <th class="admin-table__th-narrow admin-table__col--hide-mobile">DV</th>
                  <th class="admin-table__th-narrow admin-table__col--hide-mobile">DT</th>
                  <th class="admin-table__th-narrow">DS</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in standingsRowsForActivePoule" :key="row.team.id">
                  <td class="admin-table__td-center">{{ row.rank }}</td>
                  <td>{{ row.team.name }}</td>
                  <td class="admin-table__td-center">{{ row.played }}</td>
                  <td class="admin-table__td-center admin-table__col--hide-mobile">{{ row.wins }}</td>
                  <td class="admin-table__td-center admin-table__col--hide-mobile">{{ row.draws }}</td>
                  <td class="admin-table__td-center admin-table__col--hide-mobile">{{ row.losses }}</td>
                  <td class="admin-table__td-center admin-table__td-pts">{{ row.points }}</td>
                  <td class="admin-table__td-center admin-table__col--hide-mobile">{{ row.goalsFor }}</td>
                  <td class="admin-table__td-center admin-table__col--hide-mobile">{{ row.goalsAgainst }}</td>
                  <td class="admin-table__td-center">{{ row.goalDifference }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </template>

      <p v-else class="admin-schedule__notice admin-schedule__notice--muted" role="status">
        {{ emptyPouleMessage }}
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { StandingRow, TournamentMatch } from '~/types/tournament';
import { matchSideLabel } from '~/types/tournament';
import { useTournamentStore } from '~/stores/tournament';
import { useTeamsStore } from '~/stores/teams';

const REQUIRED_TEAMS = 10;

const props = defineProps<{
  section: 'group1' | 'group2' | 'knockout';
}>();

const tournamentStore = useTournamentStore();
const teamsStore = useTeamsStore();

/** Same rows as returned by GET /api/teams (after last load). */
const teamCountFromApi = computed(() => teamsStore.items.length);

const hasEnoughTeams = computed(() => teamCountFromApi.value >= REQUIRED_TEAMS);

const groupKeyForSection = computed(() => {
  const keys = tournamentStore.groupKeysSorted;
  if (props.section === 'group1') return keys[0];
  if (props.section === 'group2') return keys[1];
  return undefined;
});

const groupSectionHeading = computed(() => (props.section === 'group1' ? 'Groep 1 — terrein 1' : 'Groep 2 — terrein 2'));

const standTitleForSection = computed(() => (props.section === 'group1' ? 'Stand — groep 1' : 'Stand — groep 2'));

const standingsRowsForActivePoule = computed((): StandingRow[] => {
  const k = groupKeyForSection.value;
  if (!k) return [];
  return standingsRowsForGroup(k);
});

const emptyPouleMessage = computed(() => (props.section === 'group2' ? 'Geen tweede poule in dit schema.' : 'Geen wedstrijden voor groep 1.'));

const knockoutAdminSections = computed(() => {
  const d = tournamentStore.draft;
  if (!d) {
    return [] as { title: string; matches: TournamentMatch[] }[];
  }
  const out: { title: string; matches: TournamentMatch[] }[] = [];
  if (d.lastPlace) {
    out.push({ title: 'Laatste plaats', matches: [d.lastPlace] });
  }
  if (d.quarterFinal?.length) {
    out.push({
      title: 'Kwartfinale',
      matches: [...d.quarterFinal].sort((a, b) => a.order - b.order),
    });
  }
  if (d.semiFinal?.length) {
    out.push({
      title: 'Halve finale',
      matches: [...d.semiFinal].sort((a, b) => a.order - b.order),
    });
  }
  if (d.final) {
    out.push({ title: 'Finale', matches: [d.final] });
  }
  return out;
});

function standingsRowsForGroup(groupKey: string): StandingRow[] {
  const rows = tournamentStore.draft?.standings?.[groupKey];
  if (!rows?.length) return [];
  return [...rows].sort((a, b) => a.rank - b.rank);
}

const editingId = ref<string | null>(null);
const editForm = reactive({
  startHour: '',
  endHour: '',
  homeTeamScore: '',
  awayTeamScore: '',
  penaltyHomeTeamScore: '',
  penaltyAwayTeamScore: '',
  terrain: '',
  description: '',
});

const dragSource = ref<{ groupKey: string; index: number } | null>(null);
const dragPreviewEl = ref<HTMLElement | null>(null);

function scoreStr(v: number | null) {
  return v == null ? '–' : String(v);
}

function hasPenalties(match: TournamentMatch) {
  return match.penaltyHomeTeamScore != null || match.penaltyAwayTeamScore != null;
}

function matchTerrainLine(match: TournamentMatch): string {
  const t = match.terrain;
  return typeof t === 'string' && t.trim() ? t.trim() : '';
}

function matchDescriptionLine(match: TournamentMatch): string {
  const d = match.description;
  return typeof d === 'string' && d.trim() ? d.trim() : '';
}

function startEdit(match: TournamentMatch) {
  tournamentStore.clearGamePatchError();
  tournamentStore.clearOrderPersistError();
  editingId.value = match.id;
  editForm.startHour = match.startHour;
  editForm.endHour = match.endHour;
  editForm.homeTeamScore = match.homeTeamScore == null ? '' : String(match.homeTeamScore);
  editForm.awayTeamScore = match.awayTeamScore == null ? '' : String(match.awayTeamScore);
  editForm.penaltyHomeTeamScore = match.penaltyHomeTeamScore == null ? '' : String(match.penaltyHomeTeamScore);
  editForm.penaltyAwayTeamScore = match.penaltyAwayTeamScore == null ? '' : String(match.penaltyAwayTeamScore);
  editForm.terrain = match.terrain == null || match.terrain === undefined ? '' : String(match.terrain);
  editForm.description = match.description == null || match.description === undefined ? '' : String(match.description);
}

function cancelEdit() {
  tournamentStore.clearGamePatchError();
  tournamentStore.clearOrderPersistError();
  editingId.value = null;
}

async function saveEdit(matchId: string) {
  await tournamentStore.persistMatchFromForm(matchId, { ...editForm });
  if (!tournamentStore.gamePatchError) {
    editingId.value = null;
  }
}

function onDragStart(e: DragEvent, groupKey: string, index: number) {
  dragSource.value = { groupKey, index };
  e.dataTransfer?.setData('text/plain', String(index));
  if (!e.dataTransfer) return;
  e.dataTransfer.effectAllowed = 'move';

  const handle = e.currentTarget as HTMLElement | null;
  const row = handle?.closest('tr');
  if (!row) return;

  const rowClone = row.cloneNode(true) as HTMLTableRowElement;

  const table = document.createElement('table');
  table.className = 'admin-table-drag-ghost';
  const tbody = document.createElement('tbody');
  tbody.appendChild(rowClone);
  table.appendChild(tbody);

  const rowWidth = row.getBoundingClientRect().width;
  table.style.position = 'fixed';
  table.style.top = '-1000px';
  table.style.left = '-1000px';
  table.style.pointerEvents = 'none';
  table.style.opacity = '0.95';
  table.style.background = '#ffffff';
  table.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.18)';
  table.style.width = `${rowWidth}px`;
  table.style.tableLayout = 'fixed';

  const sourceCells = row.querySelectorAll('td');
  rowClone.querySelectorAll('td').forEach((td, i) => {
    const src = sourceCells[i] as HTMLElement | undefined;
    if (src?.offsetWidth) {
      td.style.width = `${src.offsetWidth}px`;
    }
  });

  document.body.appendChild(table);
  dragPreviewEl.value = table;

  e.dataTransfer.setDragImage(table, 24, 20);
}

function onDragEnd() {
  dragSource.value = null;
  if (dragPreviewEl.value) {
    dragPreviewEl.value.remove();
    dragPreviewEl.value = null;
  }
}

function onDragOver(e: DragEvent) {
  e.preventDefault();
}

async function onDrop(groupKey: string, toIndex: number) {
  const src = dragSource.value;
  if (!src || src.groupKey !== groupKey) return;
  dragSource.value = null;
  await tournamentStore.reorderMatchInGroupPersist(groupKey, src.index, toIndex);
}
</script>

<style scoped>
.admin-schedule__notice {
  margin: 0;
  padding: 20px 22px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #fefce8;
  font-size: 15px;
  line-height: 1.55;
  color: #374151;
}

.admin-schedule__notice--error {
  background: #fef2f2;
  border-color: #fecaca;
  color: #b91c1c;
}

.admin-schedule__patch-error {
  margin: 12px 0 0;
}

.admin-schedule__bootstrap {
  padding: 28px 24px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #fefce8;
  max-width: 520px;
}

.admin-schedule__bootstrap-text {
  margin: 0 0 16px;
  font-size: 15px;
  line-height: 1.55;
  color: #374151;
}

.admin-schedule__bootstrap-error {
  margin: 0 0 14px;
  font-size: 14px;
  font-weight: 600;
  color: #b91c1c;
}

.admin-schedule__bootstrap-btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  background: var(--color-forest);
  color: #fff;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
}

.admin-schedule__bootstrap-btn:hover:not(:disabled) {
  background: var(--color-forest-mid);
}

.admin-schedule__bootstrap-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.admin-schedule__hint {
  margin: 0 0 20px;
  font-size: 14px;
  color: #4b5563;
  line-height: 1.5;
}

.admin-schedule__hint--knockout-tab {
  margin-top: 0;
}

.admin-schedule__hint--knockout {
  margin-top: 28px;
}

.admin-schedule__notice--muted {
  background: #f9fafb;
  border-color: #e5e7eb;
  color: #6b7280;
}

.admin-group {
  margin-bottom: 28px;
}

.admin-group__title {
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-forest-dark);
  margin: 0 0 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--color-yellow);
}

.admin-table-wrap {
  overflow-x: auto;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #fff;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.admin-table th {
  text-align: left;
  padding: 10px 12px;
  background: #f3f4f6;
  font-weight: 700;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.admin-table__col-grip {
  width: 40px;
}

.admin-table__col-actions {
  width: 52px;
}

/* Wedstrijdtabellen: vaste lay-out zodat Thuis / Score / Uit onder elkaar blijven */
.admin-table--matches {
  table-layout: fixed;
}

.admin-table--matches .admin-table__col-grip-col {
  width: 52px;
}

.admin-table--matches .admin-table__col-time {
  width: 11rem;
}

.admin-table--matches .admin-table__col-score {
  width: 8.75rem;
}

.admin-table--matches col.admin-table__col-actions {
  width: 52px;
}

.admin-table--matches .admin-table__col-team {
  width: auto;
}

.admin-table--matches-knockout thead th:nth-child(3),
.admin-table--matches-knockout tbody td.admin-table__scores {
  text-align: left;
}

.admin-table--matches-group thead th:nth-child(4),
.admin-table--matches-group tbody td.admin-table__scores {
  text-align: left;
  padding-left: 8px;
}

.admin-table--matches-knockout .admin-table__row td:nth-child(2),
.admin-table--matches-knockout .admin-table__row td:nth-child(4),
.admin-table--matches-group .admin-table__row td:nth-child(3),
.admin-table--matches-group .admin-table__row td:nth-child(5) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}

/* Must beat `.admin-table th { text-align: left }` (higher specificity than `.admin-table__th-narrow` alone) */
.admin-table th.admin-table__th-narrow {
  text-align: center;
  white-space: nowrap;
  font-size: 12px;
}

.admin-table--standings th,
.admin-table--standings td {
  padding: 15px 12px;
  vertical-align: middle;
  line-height: 1.45;
}

.admin-table--standings thead th {
  padding: 14px 12px 12px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 2px solid #e5e7eb;
}

.admin-table--standings tbody td {
  border-bottom: 1px solid #eef0ee;
}

.admin-table--standings tbody tr:last-child td {
  border-bottom: none;
}

.admin-table--standings th:first-child,
.admin-table--standings td:first-child {
  padding-left: 20px;
}

.admin-table--standings th:last-child,
.admin-table--standings td:last-child {
  padding-right: 20px;
}

.admin-table--standings .admin-table__th-narrow {
  min-width: 2.65rem;
  padding-left: 10px;
  padding-right: 10px;
}

.admin-table--standings thead th.admin-table__th-narrow:first-child,
.admin-table--standings tbody td.admin-table__td-center:first-child {
  min-width: 2.75rem;
  text-align: center;
}

.admin-table--standings thead th:nth-child(2),
.admin-table--standings tbody td:nth-child(2) {
  min-width: 8.5rem;
  text-align: left;
  padding-left: 16px;
  padding-right: 18px;
}

.admin-table--standings .admin-table__th-pts {
  color: var(--color-forest);
}

.admin-table--standings tbody tr:hover td {
  background: rgba(26, 77, 46, 0.03);
}

@media (max-width: 640px) {
  .admin-table--standings .admin-table__col--hide-mobile {
    display: none;
  }
}

.admin-table__td-center {
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.admin-table__td-pts {
  font-weight: 700;
  color: var(--color-forest);
}

.admin-table__td-tbd {
  color: #6b7280;
  font-style: italic;
}

.admin-table__row td {
  padding: 10px 12px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}

.admin-table__row:last-child td {
  border-bottom: none;
}

.admin-table__row--editing td {
  background: #fefce8;
}

.admin-table--matches-group .drag-handle svg {
  width: 24px;
  height: 24px;
  display: block;
}

.admin-table--matches-group .admin-table__cell-grip {
  padding: 10px 6px;
}

.drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  color: #6b7280;
  padding: 6px;
  border-radius: 6px;
}

.drag-handle:hover {
  color: var(--color-forest);
  background: #f3f4f6;
}

.drag-handle:active {
  cursor: grabbing;
}

.admin-table__scores {
  font-variant-numeric: tabular-nums;
}

.score-pill {
  display: inline-block;
  min-width: 1.5em;
  text-align: center;
  font-weight: 700;
}

.score-sep {
  margin: 0 4px;
  color: #9ca3af;
}

.pen-row {
  display: block;
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.match-meta-row {
  display: block;
  font-size: 12px;
  line-height: 1.35;
  color: #6b7280;
  margin-top: 2px;
  font-weight: 500;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--color-forest);
  cursor: pointer;
}

.icon-btn:hover {
  background: #ecfdf5;
}

.admin-table__edit-cell {
  padding: 16px !important;
}

.edit-teams-readonly {
  margin-bottom: 14px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
}

.edit-teams-line {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: #1f2937;
}

.edit-teams-line + .edit-teams-line {
  margin-top: 6px;
}

.edit-teams-label {
  display: inline-block;
  min-width: 3.5rem;
  margin-right: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.edit-teams-tbd {
  font-style: italic;
  color: #6b7280;
  font-weight: 500;
}

.edit-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.edit-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #4b5563;
}

.edit-field--full {
  grid-column: 1 / -1;
}

.edit-textarea {
  min-height: 4.5rem;
  resize: vertical;
  font-family: var(--font-body);
  line-height: 1.45;
}

.edit-input {
  padding: 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
}

.edit-input:focus {
  outline: 2px solid var(--color-yellow);
  border-color: transparent;
}

.edit-actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  border: none;
}

.btn--primary {
  background: var(--color-forest);
  color: #fff;
}

.btn--primary:hover {
  background: var(--color-forest-mid);
}

.btn--ghost {
  background: #f3f4f6;
  color: #374151;
}
</style>

<style>
/* Appended to document.body for setDragImage; must be unscoped */
.admin-table-drag-ghost {
  border-collapse: collapse;
  font-size: 14px;
  color: #1f2937;
}

.admin-table-drag-ghost td {
  padding: 10px 12px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}

.admin-table-drag-ghost .drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  padding: 6px;
}

.admin-table-drag-ghost .drag-handle svg {
  width: 24px;
  height: 24px;
  display: block;
}

.admin-table-drag-ghost .admin-table__scores {
  font-variant-numeric: tabular-nums;
}

/* Keep edit column width; icon hidden so ghost matches live row */
.admin-table-drag-ghost .admin-table__actions .icon-btn {
  visibility: hidden;
}
</style>
