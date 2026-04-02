<template>
  <div class="drinks-panel" :class="{ 'drinks-panel--admin': adminLayout }">
    <template v-if="adminLayout">
      <p v-if="pending" class="admin-schedule__notice" role="status">Dranklijst laden…</p>
      <p v-else-if="error" class="admin-schedule__notice admin-schedule__notice--error" role="alert">Kon de dranklijst niet laden.</p>
      <div v-else-if="isEmpty" class="admin-schedule__bootstrap">
        <p class="admin-schedule__bootstrap-text" :class="{ 'admin-schedule__bootstrap-text--solo': readOnly }">
          <template v-if="readOnly">Er is nog geen dranklijst.</template>
          <template v-else> Er is nog geen dranklijst. Maak de dranklijst aan op de server; daarna wordt de pagina opnieuw geladen. </template>
        </p>
        <p v-if="!readOnly && createListError" class="admin-schedule__bootstrap-error" role="alert">
          {{ createListError }}
        </p>
        <button v-if="!readOnly" type="button" class="admin-schedule__bootstrap-btn" :disabled="creating" @click="onCreateList">
          {{ creating ? 'Bezig…' : 'Dranklijst aanmaken' }}
        </button>
      </div>
      <section v-else class="admin-group">
        <p v-if="!readOnly" class="admin-drinks-hint">Vul het aantal in en tik op het plusje om toe te voegen.</p>
        <h2 class="admin-group__title">Zuipbeker</h2>
        <div class="admin-table-wrap">
          <table class="admin-table admin-table--drinks-admin">
            <colgroup>
              <col />
              <col class="admin-drinks__col-num" />
              <col v-if="!readOnly" class="admin-drinks__col-add" />
            </colgroup>
            <thead>
              <tr>
                <th>Team</th>
                <th class="admin-drinks__th-num">Aantal</th>
                <th v-if="!readOnly" class="admin-drinks__th-add">Toevoegen</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in sortedRows" :key="row.id" class="admin-table__row">
                <td class="admin-drinks__team">{{ row.team.name }}</td>
                <td class="admin-drinks__num">{{ row.amount }}</td>
                <td v-if="!readOnly" class="admin-drinks__actions">
                  <div class="admin-drinks__add-row">
                    <input v-model.number="addAmount[row.id]" class="edit-input" type="number" min="0" step="1" :aria-label="`Aantal drankjes toevoegen voor ${row.team.name}`" @keydown.enter.prevent="onAddForRow(row)" />
                    <button type="button" class="icon-btn" title="Toevoegen" :aria-label="`Drankjes toevoegen voor ${row.team.name}`" :disabled="patchingId === row.id || !canAdd(row.id)" @click="onAddForRow(row)">
                      <svg v-if="patchingId !== row.id" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      <svg v-else class="admin-drinks__spinner" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" opacity="0.25" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
    <template v-else>
      <p v-if="pending" class="drinks-state" role="status">Dranklijst laden…</p>
      <p v-else-if="error" class="drinks-state drinks-state--error" role="alert">Kon de dranklijst niet laden.</p>
      <div v-else-if="isEmpty" class="drinks-bootstrap">
        <p class="drinks-bootstrap__text" :class="{ 'drinks-bootstrap__text--solo': readOnly }">
          <template v-if="readOnly">Er is nog geen dranklijst.</template>
          <template v-else> Er is nog geen dranklijst. Maak de dranklijst aan op de server; daarna wordt de pagina opnieuw geladen. </template>
        </p>
        <p v-if="!readOnly && createListError" class="drinks-bootstrap__error" role="alert">
          {{ createListError }}
        </p>
        <button v-if="!readOnly" type="button" class="drinks-bootstrap__btn" :disabled="creating" @click="onCreateList">
          {{ creating ? 'Bezig…' : 'Dranklijst aanmaken' }}
        </button>
      </div>
      <div v-else class="drinks-card schedule-card">
        <GroupTitle title="Zuipbeker" />
        <div class="drinks-table-wrap">
          <table class="drinks-table">
            <thead>
              <tr>
                <th>Team</th>
                <th class="drinks-table__th-num">Aantal</th>
                <th v-if="!readOnly" class="drinks-table__th-add">Toevoegen</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in sortedRows" :key="row.id">
                <td class="drinks-table__team">{{ row.team.name }}</td>
                <td class="drinks-table__num">{{ row.amount }}</td>
                <td v-if="!readOnly" class="drinks-table__actions">
                  <input v-model.number="addAmount[row.id]" class="drinks-input" type="number" min="0" step="1" :aria-label="`Aantal drankjes toevoegen voor ${row.team.name}`" @keydown.enter.prevent="onAddForRow(row)" />
                  <button type="button" class="drinks-btn" :disabled="patchingId === row.id || !canAdd(row.id)" @click="onAddForRow(row)">
                    {{ patchingId === row.id ? '…' : 'Bijwerken' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { DrinkRow } from '~/types/tournament';

const props = withDefaults(
  defineProps<{
    /** Alleen tonen: geen aanmaken of aantallen wijzigen (bijv. publieke homepage). */
    readOnly?: boolean;
    /** Zelfde blok- en tabelstijl als andere admin-tabs (speelschema, teams). */
    adminLayout?: boolean;
  }>(),
  { readOnly: false, adminLayout: false },
);

const { data, pending, error, refresh } = useFetch<DrinkRow[]>('/api/drinks', {
  key: 'drinks-list',
});

const creating = ref(false);
const createListError = ref<string | null>(null);
const patchingId = ref<string | null>(null);
const addAmount = reactive<Record<string, number>>({});

const isEmpty = computed(() => {
  if (pending.value || error.value) return false;
  const list = data.value;
  return Array.isArray(list) && list.length === 0;
});

const sortedRows = computed(() => {
  const list = data.value;
  if (!Array.isArray(list)) return [];
  const rows = [...list];
  if (props.readOnly) {
    rows.sort((a, b) => {
      if (b.amount !== a.amount) {
        return b.amount - a.amount;
      }
      return a.team.name.localeCompare(b.team.name, 'nl', { sensitivity: 'base' });
    });
  } else {
    rows.sort((a, b) => a.team.name.localeCompare(b.team.name, 'nl', { sensitivity: 'base' }));
  }
  return rows;
});

watch(
  sortedRows,
  (rows) => {
    for (const r of rows) {
      if (addAmount[r.id] === undefined) {
        addAmount[r.id] = 0;
      }
    }
  },
  { immediate: true },
);

function canAdd(id: string): boolean {
  const n = addAmount[id];
  return typeof n === 'number' && !Number.isNaN(n) && n > 0;
}

async function onCreateList() {
  creating.value = true;
  createListError.value = null;
  try {
    await $fetch('/api/drinks', { method: 'POST' });
    await refresh();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Dranklijst aanmaken mislukt. Probeer het opnieuw.';
    createListError.value = msg;
  } finally {
    creating.value = false;
  }
}

async function onAddForRow(row: DrinkRow) {
  const delta = addAmount[row.id];
  if (typeof delta !== 'number' || Number.isNaN(delta) || delta <= 0) {
    return;
  }
  patchingId.value = row.id;
  try {
    const newTotal = row.amount + Math.floor(delta);
    await $fetch(`/api/drinks/${encodeURIComponent(row.id)}`, {
      method: 'PATCH',
      body: { amount: newTotal },
    });
    addAmount[row.id] = 0;
    await refresh();
  } finally {
    patchingId.value = null;
  }
}
</script>

<style scoped>
.drinks-panel {
  min-height: 120px;
}

.drinks-state {
  margin: 0;
  padding: 24px;
  text-align: center;
  font-weight: 600;
  color: var(--color-forest-dark);
}

.drinks-state--error {
  color: #b91c1c;
}

/* Zelfde opzet als .admin-schedule__bootstrap (Toernooi aanmaken) */
.drinks-bootstrap {
  padding: 28px 24px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #fefce8;
  max-width: 520px;
}

.drinks-bootstrap__text {
  margin: 0 0 16px;
  font-size: 15px;
  line-height: 1.55;
  color: #374151;
}

.drinks-bootstrap__text--solo {
  margin-bottom: 0;
}

.drinks-bootstrap__error {
  margin: 0 0 14px;
  font-size: 14px;
  font-weight: 600;
  color: #b91c1c;
}

.drinks-bootstrap__btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  background: var(--color-forest);
  color: #fff;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  font-family: var(--font-body);
}

.drinks-bootstrap__btn:hover:not(:disabled) {
  background: var(--color-forest-mid);
}

.drinks-bootstrap__btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.drinks-card.schedule-card {
  background: var(--color-card);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(15, 51, 31, 0.1);
  border: 1px solid rgba(26, 77, 46, 0.1);
}

.drinks-table-wrap {
  overflow-x: auto;
}

.drinks-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  line-height: 1.45;
}

.drinks-table thead th {
  font-weight: 700;
  color: var(--color-forest-dark);
  background: rgba(26, 77, 46, 0.07);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 14px 12px 12px;
  text-align: left;
  border-bottom: 2px solid rgba(26, 77, 46, 0.12);
}

.drinks-table__th-num {
  text-align: center;
  width: 5.5rem;
}

.drinks-table__th-add {
  min-width: 200px;
}

.drinks-table tbody td {
  padding: 14px 12px;
  border-bottom: 1px solid #e8ebe8;
  vertical-align: middle;
}

.drinks-table tbody tr:last-child td {
  border-bottom: none;
}

.drinks-table tbody tr:hover td {
  background: rgba(26, 77, 46, 0.03);
}

.drinks-table__team {
  font-weight: 600;
  color: #1f2937;
}

.drinks-table__num {
  text-align: center;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  color: var(--color-forest);
}

.drinks-table__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.drinks-input {
  width: 5rem;
  padding: 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 14px;
  font-variant-numeric: tabular-nums;
}

.drinks-input:focus {
  outline: none;
  border-color: var(--color-forest);
  box-shadow: 0 0 0 2px rgba(26, 77, 46, 0.15);
}

.drinks-btn {
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background: #fff;
  font-weight: 600;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  font-family: var(--font-body);
}

.drinks-btn:hover:not(:disabled) {
  border-color: var(--color-forest);
  color: var(--color-forest);
}

.drinks-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* Admin-tab Zuipbeker: zelfde patronen als AdminSpeelschemaTab / AdminTeamsTab */
.drinks-panel--admin .admin-schedule__notice {
  margin: 0;
  padding: 20px 22px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #fefce8;
  font-size: 15px;
  line-height: 1.55;
  color: #374151;
}

.drinks-panel--admin .admin-schedule__notice--error {
  background: #fef2f2;
  border-color: #fecaca;
  color: #b91c1c;
}

.drinks-panel--admin .admin-schedule__bootstrap {
  padding: 28px 24px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #fefce8;
  max-width: 520px;
}

.drinks-panel--admin .admin-schedule__bootstrap-text {
  margin: 0 0 16px;
  font-size: 15px;
  line-height: 1.55;
  color: #374151;
}

.drinks-panel--admin .admin-schedule__bootstrap-text--solo {
  margin-bottom: 0;
}

.drinks-panel--admin .admin-schedule__bootstrap-error {
  margin: 0 0 14px;
  font-size: 14px;
  font-weight: 600;
  color: #b91c1c;
}

.drinks-panel--admin .admin-schedule__bootstrap-btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  background: var(--color-forest);
  color: #fff;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  font-family: var(--font-body);
}

.drinks-panel--admin .admin-schedule__bootstrap-btn:hover:not(:disabled) {
  background: var(--color-forest-mid);
}

.drinks-panel--admin .admin-schedule__bootstrap-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.drinks-panel--admin .admin-group {
  margin-bottom: 28px;
}

.drinks-panel--admin .admin-group__title {
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-forest-dark);
  margin: 0 0 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--color-yellow);
}

.drinks-panel--admin .admin-drinks-hint {
  margin: 0 0 16px;
  font-size: 14px;
  color: #4b5563;
  line-height: 1.5;
}

.drinks-panel--admin .admin-table-wrap {
  overflow-x: auto;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #fff;
}

.drinks-panel--admin .admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.drinks-panel--admin .admin-table--drinks-admin {
  table-layout: fixed;
}

.drinks-panel--admin .admin-drinks__col-num {
  width: 5.5rem;
}

.drinks-panel--admin .admin-drinks__col-add {
  width: 9.25rem;
}

.drinks-panel--admin .admin-table th {
  text-align: left;
  padding: 10px 12px;
  background: #f3f4f6;
  font-weight: 700;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.drinks-panel--admin .admin-drinks__th-num {
  text-align: center;
}

.drinks-panel--admin .admin-drinks__th-add {
  text-align: center;
  padding-left: 10px;
  padding-right: 10px;
}

.drinks-panel--admin .admin-table__row td {
  padding: 10px 12px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}

.drinks-panel--admin .admin-table__row:last-child td {
  border-bottom: none;
}

.drinks-panel--admin .admin-table__row:hover td {
  background: rgba(26, 77, 46, 0.03);
}

.drinks-panel--admin .admin-drinks__team {
  font-weight: 600;
  color: #1f2937;
}

.drinks-panel--admin .admin-drinks__num {
  text-align: center;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  color: var(--color-forest);
}

.drinks-panel--admin .admin-drinks__add-row {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  vertical-align: middle;
}

.drinks-panel--admin .admin-drinks__actions {
  text-align: center;
  vertical-align: middle;
  padding-left: 8px;
  padding-right: 8px;
}

.drinks-panel--admin .admin-drinks__actions .edit-input {
  width: 4.25rem;
  min-width: 0;
  padding: 8px 8px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-family: var(--font-body);
  font-variant-numeric: tabular-nums;
}

.drinks-panel--admin .edit-input:focus {
  outline: 2px solid var(--color-yellow);
  border-color: transparent;
}

.drinks-panel--admin .icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--color-forest);
  cursor: pointer;
}

.drinks-panel--admin .icon-btn:hover:not(:disabled) {
  background: #ecfdf5;
}

.drinks-panel--admin .icon-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.drinks-panel--admin .admin-drinks__spinner {
  animation: admin-drinks-spin 0.7s linear infinite;
}

@keyframes admin-drinks-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
