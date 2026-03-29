<template>
  <div class="admin-teams">
    <div class="admin-teams__toolbar">
      <span v-if="teamsStore.loadError" class="admin-teams__msg admin-teams__msg--error" role="alert">{{ teamsStore.loadError }}</span>
      <span v-else-if="teamsStore.saveError" class="admin-teams__msg admin-teams__msg--error" role="alert">{{ teamsStore.saveError }}</span>
      <span v-else-if="teamsStore.saveOk" class="admin-teams__msg admin-teams__msg--ok" role="status">Opgeslagen.</span>
    </div>
    <section v-for="group in teamsStore.displayGroups" :key="group" class="admin-team-group">
      <h2 class="admin-team-group__title">Groep {{ group }}</h2>
      <ul class="team-list">
        <li v-for="team in teamsStore.teamsForGroupDisplay(group)" :key="team.id" class="team-row">
          <template v-if="editingTeamId !== team.id">
            <span class="team-row__name">{{ team.name || '—' }}</span>
            <button type="button" class="icon-btn" title="Bewerken" aria-label="Bewerken" :disabled="teamsStore.saving" @click="startEdit(team)">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          </template>
          <template v-else>
            <input v-model="teamEditBuffer" type="text" class="team-row__input" :placeholder="team.id.startsWith('__empty_') ? 'Teamnaam' : ''" :disabled="teamsStore.saving" @keyup.enter="saveTeam(team)" />
            <div class="team-row__edit-actions">
              <button type="button" class="btn btn--primary btn--sm" :disabled="teamsStore.saving" @click="saveTeam(team)">
                {{ teamsStore.saving ? '…' : 'Opslaan' }}
              </button>
              <button type="button" class="btn btn--ghost btn--sm" :disabled="teamsStore.saving" @click="cancelEdit">Annuleren</button>
            </div>
          </template>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { TournamentTeam } from '~/types/tournament';
import { useTeamsStore } from '~/stores/teams';

const props = defineProps<{
  active: boolean;
}>();

const teamsStore = useTeamsStore();

const editingTeamId = ref<string | null>(null);
const teamEditBuffer = ref('');

function startEdit(team: TournamentTeam) {
  editingTeamId.value = team.id;
  teamEditBuffer.value = team.name;
}

function cancelEdit() {
  editingTeamId.value = null;
  teamEditBuffer.value = '';
}

async function saveTeam(team: TournamentTeam) {
  await teamsStore.saveTeamRow(team, teamEditBuffer.value);
  cancelEdit();
}

watch(
  () => props.active,
  (isActive) => {
    if (isActive) {
      teamsStore.loadTeams();
    }
  },
  { immediate: true },
);
</script>

<style scoped>
.admin-teams__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.btn-secondary {
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background: #fff;
  font-weight: 600;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
}

.btn-secondary:hover:not(:disabled) {
  border-color: var(--color-forest);
  color: var(--color-forest);
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.admin-teams__msg {
  font-size: 13px;
  font-weight: 600;
}

.admin-teams__msg--error {
  color: #b91c1c;
}

.admin-teams__msg--ok {
  color: var(--color-forest);
}

.admin-teams__hint {
  margin: 0 0 20px;
  font-size: 14px;
  color: #4b5563;
  line-height: 1.5;
}

.admin-team-group {
  margin-bottom: 28px;
}

.admin-team-group__title {
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-forest-dark);
  margin: 0 0 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--color-yellow);
}

.team-list {
  list-style: none;
  margin: 0;
  padding: 0;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #fff;
  overflow: hidden;
}

.team-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-bottom: 1px solid #f3f4f6;
}

.team-row:last-child {
  border-bottom: none;
}

.team-row__name {
  font-weight: 600;
  color: #1f2937;
}

.team-row__input {
  flex: 1;
  min-width: 0;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
}

.team-row__input:focus {
  outline: 2px solid var(--color-yellow);
  border-color: transparent;
}

.team-row__edit-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
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
  flex-shrink: 0;
}

.icon-btn:hover:not(:disabled) {
  background: #ecfdf5;
}

.icon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  border: none;
}

.btn--sm {
  padding: 6px 12px;
  font-size: 13px;
}

.btn--primary {
  background: var(--color-forest);
  color: #fff;
}

.btn--primary:hover:not(:disabled) {
  background: var(--color-forest-mid);
}

.btn--primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn--ghost {
  background: #f3f4f6;
  color: #374151;
}
</style>
