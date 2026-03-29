import { defineStore } from 'pinia';
import {
  type TournamentMatch,
  type TournamentOrderRequest,
  type TournamentResponse,
  type TournamentTeam,
  normalizeTournamentResponse,
} from '~/types/tournament';

function setMatchInDraft(draft: TournamentResponse, matchId: string, replacement: TournamentMatch) {
  for (const arr of Object.values(draft.groups)) {
    const i = arr.findIndex((x) => x.id === matchId);
    if (i !== -1) {
      arr[i] = replacement;
      return;
    }
  }
  const qf = draft.quarterFinal;
  if (qf) {
    const i = qf.findIndex((x) => x.id === matchId);
    if (i !== -1) {
      qf[i] = replacement;
      return;
    }
  }
  const sf = draft.semiFinal;
  if (sf) {
    const i = sf.findIndex((x) => x.id === matchId);
    if (i !== -1) {
      sf[i] = replacement;
      return;
    }
  }
  if (draft.lastPlace?.id === matchId) {
    draft.lastPlace = replacement;
    return;
  }
  if (draft.final?.id === matchId) {
    draft.final = replacement;
    return;
  }
}

/** Plain JSON copy: Pinia/Vue reactive proxies are not structuredClone-able. */
function cloneMatchPlain(m: TournamentMatch): TournamentMatch {
  return JSON.parse(JSON.stringify(m)) as TournamentMatch;
}

let deleteTournamentOkTimer: ReturnType<typeof setTimeout> | null = null;

function cloneTournamentNormalized(src: TournamentResponse): TournamentResponse {
  return normalizeTournamentResponse(structuredClone(src));
}

function cloneGroupsPlain(groups: TournamentResponse['groups']): TournamentResponse['groups'] {
  return JSON.parse(JSON.stringify(groups)) as TournamentResponse['groups'];
}

export function parseScoreInput(raw: string): number | null {
  const t = raw.trim();
  if (t === '') return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

/** Upstream can return groep a en b leeg voordat POST /tournament het schema heeft gegenereerd. */
export function isTournamentUnset(response: TournamentResponse): boolean {
  const a = response.groups?.['a'];
  const b = response.groups?.['b'];
  const aEmpty = !a || a.length === 0;
  const bEmpty = !b || b.length === 0;
  return aEmpty && bEmpty;
}

export const useTournamentStore = defineStore('tournament', () => {
  const draft = ref<TournamentResponse | null>(null);
  const fetchStatus = ref<'idle' | 'pending' | 'success' | 'error'>('idle');
  const initialized = ref(false);
  const createTournamentLoading = ref(false);
  const createTournamentError = ref<string | null>(null);
  const deleteTournamentLoading = ref(false);
  const deleteTournamentError = ref<string | null>(null);
  const deleteTournamentOk = ref(false);
  const gamePatchLoading = ref(false);
  const gamePatchError = ref<string | null>(null);
  const orderPersistLoading = ref(false);
  const orderPersistError = ref<string | null>(null);

  function clearGamePatchError() {
    gamePatchError.value = null;
  }

  function clearOrderPersistError() {
    orderPersistError.value = null;
  }

  function buildTournamentOrderPayload(): TournamentOrderRequest {
    if (!draft.value) {
      return { groups: {} };
    }
    const groups: Record<string, string[]> = {};
    for (const key of Object.keys(draft.value.groups).sort()) {
      const arr = draft.value.groups[key];
      if (!arr?.length) {
        groups[key] = [];
        continue;
      }
      const ordered = [...arr].sort((a, b) => a.order - b.order);
      groups[key] = ordered.map((m) => m.id);
    }
    return { groups };
  }

  /**
   * Reorders a group locally, then POSTs full group id order to the BFF.
   * On failure, restores all groups from a snapshot.
   */
  async function reorderMatchInGroupPersist(groupKey: string, fromIndex: number, toIndex: number) {
    if (!draft.value) return;
    const arr = draft.value.groups[groupKey];
    if (
      !arr ||
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= arr.length ||
      toIndex >= arr.length
    ) {
      return;
    }

    const groupsBackup = cloneGroupsPlain(draft.value.groups);
    orderPersistError.value = null;
    reorderMatchInGroup(groupKey, fromIndex, toIndex);
    orderPersistLoading.value = true;
    try {
      await $fetch('/api/tournament/order', {
        method: 'POST',
        body: buildTournamentOrderPayload(),
      });
    } catch {
      orderPersistError.value = 'Volgorde opslaan op de server mislukt.';
      draft.value.groups = groupsBackup;
    } finally {
      orderPersistLoading.value = false;
    }
  }

  function initClient() {
    initialized.value = true;
  }

  async function fetchRemote() {
    fetchStatus.value = 'pending';
    try {
      const data = await $fetch<TournamentResponse>('/api/tournament');
      if (draft.value === null) {
        draft.value = cloneTournamentNormalized(data);
      }
      fetchStatus.value = 'success';
    } catch {
      fetchStatus.value = 'error';
    }
  }

  async function resetFromServer() {
    fetchStatus.value = 'pending';
    try {
      const data = await $fetch<TournamentResponse>('/api/tournament');
      draft.value = cloneTournamentNormalized(data);
      fetchStatus.value = 'success';
    } catch {
      fetchStatus.value = 'error';
    }
  }

  const needsTournamentBootstrap = computed(() => draft.value != null && isTournamentUnset(draft.value));

  async function createTournamentOnServer() {
    createTournamentError.value = null;
    createTournamentLoading.value = true;
    try {
      await $fetch('/api/tournament', { method: 'POST' });
      if (import.meta.client) {
        window.location.reload();
      }
    } catch {
      createTournamentError.value = 'Toernooi aanmaken mislukt. Probeer het opnieuw.';
      createTournamentLoading.value = false;
    }
  }

  function clearDeleteTournamentOkTimer() {
    if (deleteTournamentOkTimer) {
      clearTimeout(deleteTournamentOkTimer);
      deleteTournamentOkTimer = null;
    }
  }

  async function deleteTournamentOnServer() {
    deleteTournamentError.value = null;
    clearDeleteTournamentOkTimer();
    deleteTournamentOk.value = false;
    deleteTournamentLoading.value = true;
    try {
      await $fetch('/api/tournament', { method: 'DELETE' });
      await resetFromServer();
      if (fetchStatus.value === 'success') {
        deleteTournamentOk.value = true;
        deleteTournamentOkTimer = setTimeout(() => {
          deleteTournamentOk.value = false;
          deleteTournamentOkTimer = null;
        }, 2500);
      } else {
        deleteTournamentError.value = 'Toernooi verwijderd op de server, maar het schema kon niet opnieuw worden geladen.';
      }
    } catch {
      deleteTournamentError.value = 'Toernooi verwijderen mislukt.';
    } finally {
      deleteTournamentLoading.value = false;
    }
  }

  function findMatch(matchId: string): TournamentMatch | null {
    if (!draft.value) return null;
    for (const list of Object.values(draft.value.groups)) {
      const m = list.find((x) => x.id === matchId);
      if (m) return m;
    }
    const qf = draft.value.quarterFinal;
    if (qf) {
      const m = qf.find((x) => x.id === matchId);
      if (m) return m;
    }
    const sf = draft.value.semiFinal;
    if (sf) {
      const m = sf.find((x) => x.id === matchId);
      if (m) return m;
    }
    if (draft.value.lastPlace?.id === matchId) {
      return draft.value.lastPlace;
    }
    if (draft.value.final?.id === matchId) {
      return draft.value.final;
    }
    return null;
  }

  function reorderMatchInGroup(groupKey: string, fromIndex: number, toIndex: number) {
    if (!draft.value) return;
    const arr = draft.value.groups[groupKey];
    if (!arr || fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    if (fromIndex >= arr.length || toIndex >= arr.length) return;
    const originalSlots = arr.map((match) => ({
      startHour: match.startHour,
      endHour: match.endHour,
    }));
    const moved = arr.splice(fromIndex, 1)[0];
    if (moved === undefined) return;
    arr.splice(toIndex, 0, moved);
    arr.forEach((match, i) => {
      match.order = i + 1;
      const slot = originalSlots[i];
      if (slot) {
        match.startHour = slot.startHour;
        match.endHour = slot.endHour;
      }
    });
  }

  function updateMatchFromForm(
    matchId: string,
    form: {
      startHour: string;
      endHour: string;
      homeTeamScore: string;
      awayTeamScore: string;
      penaltyHomeTeamScore: string;
      penaltyAwayTeamScore: string;
      terrain: string;
      description: string;
    },
  ) {
    const m = findMatch(matchId);
    if (!m) return;
    m.startHour = form.startHour.trim();
    m.endHour = form.endHour.trim();
    m.homeTeamScore = parseScoreInput(form.homeTeamScore);
    m.awayTeamScore = parseScoreInput(form.awayTeamScore);
    m.penaltyHomeTeamScore = parseScoreInput(form.penaltyHomeTeamScore);
    m.penaltyAwayTeamScore = parseScoreInput(form.penaltyAwayTeamScore);
    const ter = form.terrain.trim();
    const desc = form.description.trim();
    m.terrain = ter ? ter : null;
    m.description = desc ? desc : null;
  }

  /** Past de form lokaal toe en synchroniseert met PATCH /api/games/:id (BFF → upstream /games/:id). Bij fout wordt de wedstrijd teruggedraaid. */
  async function persistMatchFromForm(
    matchId: string,
    form: {
      startHour: string;
      endHour: string;
      homeTeamScore: string;
      awayTeamScore: string;
      penaltyHomeTeamScore: string;
      penaltyAwayTeamScore: string;
      terrain: string;
      description: string;
    },
  ) {
    if (!draft.value) return;
    const m = findMatch(matchId);
    if (!m) return;

    const backup = cloneMatchPlain(m);
    gamePatchError.value = null;
    gamePatchLoading.value = true;

    updateMatchFromForm(matchId, form);
    const updated = findMatch(matchId);
    if (!updated) {
      gamePatchLoading.value = false;
      return;
    }

    try {
      const body = cloneMatchPlain(updated);
      await $fetch(`/api/games/${encodeURIComponent(matchId)}`, {
        method: 'PATCH',
        body,
      });
    } catch {
      gamePatchError.value = 'Wedstrijd opslaan op de server mislukt.';
      setMatchInDraft(draft.value, matchId, backup);
    } finally {
      gamePatchLoading.value = false;
    }
  }

  const groupKeysSorted = computed(() => {
    if (!draft.value) return [] as string[];
    return Object.keys(draft.value.groups).sort();
  });

  function matchesForGroupSorted(groupKey: string): TournamentMatch[] {
    if (!draft.value) return [];
    const raw = draft.value.groups[groupKey];
    if (!raw) return [];
    return [...raw].sort((a, b) => a.order - b.order);
  }

  function buildTeamRowsForGroup(groupKey: string): TournamentTeam[] {
    const matches = matchesForGroupSorted(groupKey);
    const map = new Map<string, TournamentTeam>();
    for (const m of matches) {
      if (m.homeTeam) map.set(m.homeTeam.id, { ...m.homeTeam });
      if (m.awayTeam) map.set(m.awayTeam.id, { ...m.awayTeam });
    }
    const rows = Array.from(map.values());
    const groupNum = matches[0]?.homeTeam?.group ?? groupKey;
    const target = Math.max(5, rows.length);
    let i = 0;
    while (rows.length < target) {
      rows.push({
        id: `__empty_${groupKey}_${i}`,
        name: '',
        group: String(groupNum),
      });
      i += 1;
    }
    return rows;
  }

  return {
    draft,
    fetchStatus,
    initialized,
    createTournamentLoading,
    createTournamentError,
    deleteTournamentLoading,
    deleteTournamentError,
    deleteTournamentOk,
    gamePatchLoading,
    gamePatchError,
    clearGamePatchError,
    orderPersistLoading,
    orderPersistError,
    clearOrderPersistError,
    reorderMatchInGroupPersist,
    needsTournamentBootstrap,
    initClient,
    fetchRemote,
    resetFromServer,
    createTournamentOnServer,
    deleteTournamentOnServer,
    findMatch,
    reorderMatchInGroup,
    updateMatchFromForm,
    persistMatchFromForm,
    groupKeysSorted,
    matchesForGroupSorted,
    buildTeamRowsForGroup,
  };
});
