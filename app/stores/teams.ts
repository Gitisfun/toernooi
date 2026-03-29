import { defineStore } from 'pinia';
import type { TournamentTeam } from '~/types/tournament';

let saveOkTimer: ReturnType<typeof setTimeout> | null = null;
let deleteAllTeamsOkTimer: ReturnType<typeof setTimeout> | null = null;

export const useTeamsStore = defineStore('teams', () => {
  const items = ref<TournamentTeam[]>([]);
  const loading = ref(false);
  const saving = ref(false);
  const loadError = ref<string | null>(null);
  const saveError = ref<string | null>(null);
  const saveOk = ref(false);
  const deleteAllTeamsLoading = ref(false);
  const deleteAllTeamsError = ref<string | null>(null);
  const deleteAllTeamsOk = ref(false);

  /** Always show groep 1 and 2; teams from the API are placed in the matching group, with ≥5 rows per group. */
  const displayGroups = computed(() => ['1', '2']);

  function teamsForGroupDisplay(group: string): TournamentTeam[] {
    const fromDraft = items.value
      .filter((t) => t.group === group)
      .slice()
      .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
    const target = Math.max(5, fromDraft.length);
    const rows: TournamentTeam[] = [...fromDraft];
    let i = 0;
    while (rows.length < target) {
      rows.push({ id: `__empty_${group}_${i}`, name: '', group });
      i += 1;
    }
    return rows;
  }

  async function applyFromServer() {
    const data = await $fetch<TournamentTeam[]>('/api/teams');
    items.value = data.map((t) => ({ ...t }));
  }

  async function loadTeams() {
    loadError.value = null;
    saveError.value = null;
    loading.value = true;
    try {
      await applyFromServer();
    } catch {
      loadError.value = 'Teams konden niet worden geladen.';
    } finally {
      loading.value = false;
    }
  }

  function buildPostPayload(): TournamentTeam[] {
    return items.value
      .filter((t) => t.name.trim() !== '')
      .map((t) => ({
        id: t.id,
        name: t.name.trim(),
        group: t.group,
      }));
  }

  function clearSaveOkTimer() {
    if (saveOkTimer) {
      clearTimeout(saveOkTimer);
      saveOkTimer = null;
    }
  }

  async function persistTeams() {
    saveError.value = null;
    clearSaveOkTimer();
    saveOk.value = false;
    saving.value = true;
    try {
      const payload = buildPostPayload();
      await $fetch('/api/teams', {
        method: 'POST',
        body: payload,
      });
      await applyFromServer();
      saveOk.value = true;
      saveOkTimer = setTimeout(() => {
        saveOk.value = false;
        saveOkTimer = null;
      }, 2500);
    } catch {
      saveError.value = 'Teams konden niet worden opgeslagen.';
    } finally {
      saving.value = false;
    }
  }

  function newTeamId(group: string) {
    return `team-${group}-${Date.now()}`;
  }

  async function saveTeamRow(team: TournamentTeam, editedName: string) {
    const name = editedName.trim();

    if (team.id.startsWith('__empty_')) {
      if (!name) return;
      items.value.push({
        id: newTeamId(team.group),
        name,
        group: team.group,
      });
    } else {
      const row = items.value.find((t) => t.id === team.id);
      if (row) {
        row.name = name;
      }
    }

    await persistTeams();
  }

  function clearDeleteAllTeamsOkTimer() {
    if (deleteAllTeamsOkTimer) {
      clearTimeout(deleteAllTeamsOkTimer);
      deleteAllTeamsOkTimer = null;
    }
  }

  async function deleteAllTeamsOnServer() {
    deleteAllTeamsError.value = null;
    clearDeleteAllTeamsOkTimer();
    deleteAllTeamsOk.value = false;
    deleteAllTeamsLoading.value = true;
    try {
      await $fetch('/api/teams', { method: 'DELETE' });
      await applyFromServer();
      deleteAllTeamsOk.value = true;
      deleteAllTeamsOkTimer = setTimeout(() => {
        deleteAllTeamsOk.value = false;
        deleteAllTeamsOkTimer = null;
      }, 2500);
    } catch {
      deleteAllTeamsError.value = 'Teams verwijderen mislukt.';
    } finally {
      deleteAllTeamsLoading.value = false;
    }
  }

  return {
    items,
    loading,
    saving,
    loadError,
    saveError,
    saveOk,
    deleteAllTeamsLoading,
    deleteAllTeamsError,
    deleteAllTeamsOk,
    displayGroups,
    teamsForGroupDisplay,
    loadTeams,
    persistTeams,
    saveTeamRow,
    deleteAllTeamsOnServer,
  };
});
