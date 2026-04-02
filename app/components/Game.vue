<template>
  <div class="game" :class="{ 'game--played': isPlayed }">
    <div class="game__time">
      <span class="game__time-start">{{ timeStart }}</span>
      <span class="game__time-sep" style="margin-left: 4px; margin-right: 3px" aria-hidden="true">-</span>
      <span class="game__time-end">{{ timeEnd }}</span>
    </div>
    <div class="game__home" :class="{ 'game__team--winner': homeWins, 'game__team--tbd': homeTeamTbd }">
      {{ homeTeam }}
    </div>
    <div class="game__scores">
      <div class="game__score">
        <template v-if="isPlayed">
          <span class="game__goals" :class="{ 'game__goals--winner': homeWins }">{{ homeGoals }}</span>
          <span class="game__separator">-</span>
          <span class="game__goals" :class="{ 'game__goals--winner': awayWins }">{{ awayGoals }}</span>
        </template>
        <template v-else>
          <span class="game__goals game__goals--empty">–</span>
          <span class="game__separator">-</span>
          <span class="game__goals game__goals--empty">–</span>
        </template>
      </div>
      <div v-if="isPlayed" class="game__penalties" aria-label="Strafschoppen">
        <span
          class="game__pen"
          :class="{
            'game__pen--winner': homePenWins,
            'game__pen--empty': homePenalties === null,
          }"
          >{{ formatPenalty(homePenalties) }}</span
        >
        <span class="game__separator game__separator--pen">-</span>
        <span
          class="game__pen"
          :class="{
            'game__pen--winner': awayPenWins,
            'game__pen--empty': awayPenalties === null,
          }"
          >{{ formatPenalty(awayPenalties) }}</span
        >
      </div>
      <div v-if="terrainDisplay" class="game__meta">{{ terrainDisplay }}</div>
      <div v-if="descriptionDisplay" class="game__meta">{{ descriptionDisplay }}</div>
    </div>
    <div class="game__away" :class="{ 'game__team--winner': awayWins, 'game__team--tbd': awayTeamTbd }">
      {{ awayTeam }}
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    timeStart: string;
    timeEnd: string;
    homeTeam: string;
    awayTeam: string;
    /** Team nog niet bekend (knockout-placeholder). */
    homeTeamTbd?: boolean;
    awayTeamTbd?: boolean;
    homeGoals?: number | null;
    awayGoals?: number | null;
    homePenalties?: number | null;
    awayPenalties?: number | null;
    terrain?: string | null;
    description?: string | null;
  }>(),
  {
    homeTeamTbd: false,
    awayTeamTbd: false,
    homeGoals: null,
    awayGoals: null,
    homePenalties: null,
    awayPenalties: null,
    terrain: null,
    description: null,
  },
);

const terrainDisplay = computed(() => {
  const t = props.terrain;
  return typeof t === 'string' && t.trim() ? t.trim() : '';
});

const descriptionDisplay = computed(() => {
  const d = props.description;
  return typeof d === 'string' && d.trim() ? d.trim() : '';
});

const isPlayed = computed(() => {
  return props.homeGoals !== null && props.awayGoals !== null;
});

const hasPenaltyPair = computed(() => {
  return props.homePenalties !== null && props.awayPenalties !== null;
});

const homeWins = computed(() => props.homeGoals != null && props.awayGoals != null && props.homeGoals > props.awayGoals);

const awayWins = computed(() => props.homeGoals != null && props.awayGoals != null && props.awayGoals > props.homeGoals);

const homePenWins = computed(() => hasPenaltyPair.value && props.homePenalties != null && props.awayPenalties != null && props.homePenalties > props.awayPenalties);

const awayPenWins = computed(() => hasPenaltyPair.value && props.homePenalties != null && props.awayPenalties != null && props.awayPenalties > props.homePenalties);

function formatPenalty(value: number | null | undefined) {
  return value != null ? String(value) : '–';
}
</script>

<style scoped>
.game {
  display: grid;
  /* minmax(0,1fr) zodat teamnamen mogen krimpen i.p.v. de rij breder dan het scherm te maken */
  grid-template-columns: 5.5rem minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  min-width: 0;
  padding: 12px 16px;
  border-bottom: 1px solid #e8ebe6;
  font-size: 14px;
  gap: 10px 12px;
  background: #fff;
  transition: background 0.12s ease;
}

.game:nth-child(even) {
  background: #fafbf9;
}

.game:last-child {
  border-bottom: none;
}

.game__time {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0;
  color: #5c6b5f;
  font-size: 13px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.game__home {
  min-width: 0;
  text-align: right;
  font-weight: 600;
  color: #1f2937;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.game__away {
  min-width: 0;
  text-align: left;
  font-weight: 600;
  color: #1f2937;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.game__team--winner {
  font-weight: 800;
  color: var(--color-forest-dark);
}

.game__team--tbd {
  font-weight: 500;
  font-style: italic;
  color: #6b7280;
}

.game__scores {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: min-content;
  max-width: 100%;
}

.game__score {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.game__penalties {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
}

.game__pen {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 4px;
  border-radius: 5px;
  background: var(--color-score-pen);
  font-weight: 700;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: #fff;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
}

.game__pen--winner {
  background: var(--color-forest);
  color: #fff;
}

.game__pen--empty {
  background: transparent;
  color: #b8c4bc;
  box-shadow: inset 0 0 0 1px #dde3db;
}

.game__separator--pen {
  font-size: 10px;
}

.game__meta {
  max-width: min(14rem, 100%);
  min-width: 0;
  text-align: center;
  font-size: 11px;
  line-height: 1.35;
  font-weight: 500;
  color: #6b7280;
  overflow-wrap: anywhere;
}

.game__goals {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: var(--color-score-match);
  font-weight: 800;
  font-size: 14px;
  font-variant-numeric: tabular-nums;
  color: var(--color-forest-dark);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
}

.game__goals--winner {
  background: var(--color-forest);
  color: #fff;
  box-shadow: none;
}

.game__goals--empty {
  background: transparent;
  color: #b8c4bc;
  box-shadow: inset 0 0 0 1px #dde3db;
}

.game__separator {
  color: #7a8a7e;
  font-size: 12px;
  font-weight: 700;
}

.game--played .game__time {
  color: #6b7a6f;
}

@media (max-width: 640px) {
  .game {
    grid-template-columns: 3.35rem minmax(0, 1fr) auto minmax(0, 1fr);
    padding: 10px 10px;
    font-size: 13px;
    gap: 6px 8px;
  }

  .game__time {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    line-height: 1.2;
  }

  .game__time-sep {
    display: none;
  }
}

@media (max-width: 480px) {
  .game {
    grid-template-columns: 3rem minmax(0, 1fr) auto minmax(0, 1fr);
    padding: 8px 8px;
    font-size: 13px;
    gap: 4px 6px;
  }

  .game__time {
    font-size: 11px;
  }

  .game__goals {
    width: 22px;
    height: 22px;
    font-size: 12px;
  }

  .game__pen {
    min-width: 16px;
    height: 16px;
    font-size: 10px;
  }
}
</style>
