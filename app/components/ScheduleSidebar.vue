<template>
  <aside class="sidebar" :aria-label="showStandings ? 'Legenda en standen' : 'Legenda'">
    <div class="sidebar__card sidebar__card--legend">
      <h2 class="sidebar__heading">Legenda</h2>
      <ul class="legend">
        <li class="legend__item">
          <span class="legend__swatch legend__swatch--match" />
          <span class="legend__text">Wedstrijdscore</span>
        </li>
        <li class="legend__item">
          <span class="legend__swatch legend__swatch--pen" />
          <span class="legend__text">Strafschoppen</span>
        </li>
        <li class="legend__item">
          <span class="legend__swatch legend__swatch--win" />
          <span class="legend__text">Winnaar (hogere score)</span>
        </li>
      </ul>
    </div>
    <template v-if="showStandings && standingsGroupKeys.length">
      <div v-for="groupKey in standingsGroupKeys" :key="groupKey" class="sidebar__card">
        <h2 class="sidebar__heading">{{ groupStandingsTitle(groupKey) }}</h2>
        <ol class="standings">
          <li v-for="row in standingsRowsSorted(groupKey)" :key="row.team.id" class="standings__row">
            <span class="standings__rank">{{ row.rank }}</span>
            <div class="standings__team-block">
              <span class="standings__team">{{ row.team.name }}</span>
              <span class="standings__sub">{{ row.played }} wedstr. · {{ row.wins }}-{{ row.draws }}-{{ row.losses }}</span>
            </div>
            <span class="standings__pts">{{ row.points }}</span>
          </li>
        </ol>
      </div>
    </template>
  </aside>
</template>

<script setup lang="ts">
import type { StandingRow } from '~/types/tournament';

const props = withDefaults(
  defineProps<{
    standings?: Record<string, StandingRow[]>;
    /** Zet op false als standen op de hoofdpagina per tab getoond worden. */
    showStandings?: boolean;
  }>(),
  {
    standings: () => ({}),
    showStandings: true,
  },
);

const standingsGroupKeys = computed(() =>
  Object.keys(props.standings)
    .filter((k) => (props.standings[k]?.length ?? 0) > 0)
    .sort(),
);

function groupStandingsTitle(key: string) {
  return `Groep ${key.toUpperCase()} — stand`;
}

function standingsRowsSorted(groupKey: string): StandingRow[] {
  const rows = props.standings[groupKey];
  if (!rows?.length) return [];
  return [...rows].sort((a, b) => a.rank - b.rank);
}
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar__card {
  background: var(--color-card);
  border-radius: 12px;
  padding: 18px 18px 16px;
  box-shadow: 0 4px 20px rgba(15, 51, 31, 0.08);
  border: 1px solid rgba(26, 77, 46, 0.08);
}

.sidebar__heading {
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-forest-dark);
  margin: 0 0 14px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--color-yellow);
}

.legend {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.legend__item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #374151;
  font-weight: 500;
}

.legend__swatch {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 5px;
}

.legend__swatch--match {
  background: var(--color-score-match);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
}

.legend__swatch--pen {
  background: var(--color-score-pen);
}

.legend__swatch--win {
  background: var(--color-forest);
}

.standings {
  list-style: none;
  margin: 0;
  padding: 0;
}

.standings__row {
  display: grid;
  grid-template-columns: 28px 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #eef0ee;
  font-size: 13px;
}

.standings__row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.standings__rank {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: var(--color-forest);
  color: #fff;
  font-weight: 700;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.standings__team-block {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.standings__team {
  font-weight: 600;
  color: #1f2937;
}

.standings__sub {
  font-size: 11px;
  color: #6b7280;
  font-variant-numeric: tabular-nums;
}

.standings__pts {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-forest);
}

@media (max-width: 640px) {
  .sidebar__card--legend {
    display: none;
  }

  /* Geen lege aside als alleen legenda (zoals homepage met showStandings=false) */
  .sidebar:not(:has(.sidebar__card:not(.sidebar__card--legend))) {
    display: none;
  }
}
</style>
