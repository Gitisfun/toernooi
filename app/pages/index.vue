<template>
  <div class="speelschema">
    <SiteHeader v-model:public-tab="publicTab" :has-second-poule="!!groupSection2" :show-schedule-tabs="!pending && !error" />
    <div class="speelschema__main">
      <div class="speelschema__layout">
        <main class="speelschema__schedule">
          <p v-if="pending" class="schedule-state" role="status">Schema laden…</p>
          <p v-else-if="error" class="schedule-state schedule-state--error" role="alert">Kon het schema niet laden.</p>
          <template v-else>
            <div v-show="publicTab === 'group1'" role="tabpanel" :aria-hidden="publicTab !== 'group1'" class="schedule-tab-panel">
              <template v-if="groupSection1">
                <div class="schedule-card schedule-card--spaced schedule-card--first-in-panel">
                  <GroupTitle title="Groep 1 — terrein 1" />
                  <div class="schedule-card__games">
                    <Game
                      v-for="match in groupSection1.matches"
                      :key="match.id"
                      :time-start="match.startHour"
                      :time-end="match.endHour"
                      :home-team="matchSideLabel(match.homeTeam)"
                      :away-team="matchSideLabel(match.awayTeam)"
                      :home-team-tbd="match.homeTeam == null"
                      :away-team-tbd="match.awayTeam == null"
                      :home-goals="match.homeTeamScore"
                      :away-goals="match.awayTeamScore"
                      :home-penalties="match.penaltyHomeTeamScore"
                      :away-penalties="match.penaltyAwayTeamScore"
                      :terrain="match.terrain"
                      :description="match.description"
                    />
                  </div>
                </div>
                <div v-if="standingsRowsGroup1.length" class="schedule-card schedule-card--spaced">
                  <GroupTitle title="Stand — groep 1" />
                  <div class="standings-table-wrap">
                    <table class="standings-table">
                      <thead>
                        <tr>
                          <th class="standings-table__th-num">#</th>
                          <th>Team</th>
                          <th class="standings-table__th-num">Wed</th>
                          <th class="standings-table__th-num standings-table__col--hide-mobile">W</th>
                          <th class="standings-table__th-num standings-table__col--hide-mobile">G</th>
                          <th class="standings-table__th-num standings-table__col--hide-mobile">V</th>
                          <th class="standings-table__th-num standings-table__th-num--pts">P</th>
                          <th class="standings-table__th-num standings-table__col--hide-mobile">DV</th>
                          <th class="standings-table__th-num standings-table__col--hide-mobile">DT</th>
                          <th class="standings-table__th-num">DS</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="row in standingsRowsGroup1" :key="row.team.id">
                          <td class="standings-table__num">{{ row.rank }}</td>
                          <td class="standings-table__team">{{ row.team.name }}</td>
                          <td class="standings-table__num">{{ row.played }}</td>
                          <td class="standings-table__num standings-table__col--hide-mobile">{{ row.wins }}</td>
                          <td class="standings-table__num standings-table__col--hide-mobile">{{ row.draws }}</td>
                          <td class="standings-table__num standings-table__col--hide-mobile">{{ row.losses }}</td>
                          <td class="standings-table__num standings-table__num--pts">{{ row.points }}</td>
                          <td class="standings-table__num standings-table__col--hide-mobile">{{ row.goalsFor }}</td>
                          <td class="standings-table__num standings-table__col--hide-mobile">{{ row.goalsAgainst }}</td>
                          <td class="standings-table__num">{{ row.goalDifference }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </template>
              <p v-else class="schedule-empty">Geen wedstrijden voor groep 1.</p>
            </div>

            <div v-show="publicTab === 'group2'" role="tabpanel" :aria-hidden="publicTab !== 'group2'" class="schedule-tab-panel">
              <template v-if="groupSection2">
                <div class="schedule-card schedule-card--spaced schedule-card--first-in-panel">
                  <GroupTitle title="Groep 2 — terrein 2" />
                  <div class="schedule-card__games">
                    <Game
                      v-for="match in groupSection2.matches"
                      :key="match.id"
                      :time-start="match.startHour"
                      :time-end="match.endHour"
                      :home-team="matchSideLabel(match.homeTeam)"
                      :away-team="matchSideLabel(match.awayTeam)"
                      :home-team-tbd="match.homeTeam == null"
                      :away-team-tbd="match.awayTeam == null"
                      :home-goals="match.homeTeamScore"
                      :away-goals="match.awayTeamScore"
                      :home-penalties="match.penaltyHomeTeamScore"
                      :away-penalties="match.penaltyAwayTeamScore"
                      :terrain="match.terrain"
                      :description="match.description"
                    />
                  </div>
                </div>
                <div v-if="standingsRowsGroup2.length" class="schedule-card schedule-card--spaced">
                  <GroupTitle title="Stand — groep 2" />
                  <div class="standings-table-wrap">
                    <table class="standings-table">
                      <thead>
                        <tr>
                          <th class="standings-table__th-num">#</th>
                          <th>Team</th>
                          <th class="standings-table__th-num">Wed</th>
                          <th class="standings-table__th-num standings-table__col--hide-mobile">W</th>
                          <th class="standings-table__th-num standings-table__col--hide-mobile">G</th>
                          <th class="standings-table__th-num standings-table__col--hide-mobile">V</th>
                          <th class="standings-table__th-num standings-table__th-num--pts">P</th>
                          <th class="standings-table__th-num standings-table__col--hide-mobile">DV</th>
                          <th class="standings-table__th-num standings-table__col--hide-mobile">DT</th>
                          <th class="standings-table__th-num">DS</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="row in standingsRowsGroup2" :key="row.team.id">
                          <td class="standings-table__num">{{ row.rank }}</td>
                          <td class="standings-table__team">{{ row.team.name }}</td>
                          <td class="standings-table__num">{{ row.played }}</td>
                          <td class="standings-table__num standings-table__col--hide-mobile">{{ row.wins }}</td>
                          <td class="standings-table__num standings-table__col--hide-mobile">{{ row.draws }}</td>
                          <td class="standings-table__num standings-table__col--hide-mobile">{{ row.losses }}</td>
                          <td class="standings-table__num standings-table__num--pts">{{ row.points }}</td>
                          <td class="standings-table__num standings-table__col--hide-mobile">{{ row.goalsFor }}</td>
                          <td class="standings-table__num standings-table__col--hide-mobile">{{ row.goalsAgainst }}</td>
                          <td class="standings-table__num">{{ row.goalDifference }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </template>
              <p v-else class="schedule-empty">Geen tweede poule in dit schema.</p>
            </div>

            <div v-show="publicTab === 'knockout'" role="tabpanel" :aria-hidden="publicTab !== 'knockout'" class="schedule-tab-panel">
              <template v-if="knockoutSections.length">
                <div v-for="block in knockoutSections" :key="block.key" class="schedule-card schedule-card--spaced" :class="{ 'schedule-card--first-in-panel': block.key === knockoutSections[0]?.key }">
                  <GroupTitle :title="block.title" />
                  <div class="schedule-card__games">
                    <Game
                      v-for="match in block.matches"
                      :key="match.id"
                      :time-start="match.startHour"
                      :time-end="match.endHour"
                      :home-team="matchSideLabel(match.homeTeam)"
                      :away-team="matchSideLabel(match.awayTeam)"
                      :home-team-tbd="match.homeTeam == null"
                      :away-team-tbd="match.awayTeam == null"
                      :home-goals="match.homeTeamScore"
                      :away-goals="match.awayTeamScore"
                      :home-penalties="match.penaltyHomeTeamScore"
                      :away-penalties="match.penaltyAwayTeamScore"
                      :terrain="match.terrain"
                      :description="match.description"
                    />
                  </div>
                </div>
              </template>
              <p v-else class="schedule-empty">Nog geen knockoutwedstrijden in het schema.</p>
            </div>

            <div v-show="publicTab === 'drinks'" role="tabpanel" :aria-hidden="publicTab !== 'drinks'" class="schedule-tab-panel">
              <DrinksPanel read-only class="drinks-panel--first" />
            </div>
          </template>
        </main>
        <ScheduleSidebar class="speelschema__sidebar" :standings="sidebarStandings" :show-standings="false" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StandingRow, TournamentMatch, TournamentResponse } from '~/types/tournament';
import { matchSideLabel, normalizeTournamentResponse } from '~/types/tournament';

const route = useRoute();
const runtimeConfig = useRuntimeConfig();
const siteName = runtimeConfig.public.siteName as string;
const siteDescription = runtimeConfig.public.siteDescription as string;
const ogImageUrl = runtimeConfig.public.ogImageUrl as string;

const pageTitle = 'Speelschema, standen en zuipbeker';

useSeoMeta({
  title: pageTitle,
  description: siteDescription,
  ogTitle: pageTitle,
  ogDescription: siteDescription,
  ogType: 'website',
  ogSiteName: siteName,
  twitterCard: 'summary_large_image',
  twitterTitle: pageTitle,
  twitterDescription: siteDescription,
  robots: 'index, follow',
});

if (ogImageUrl) {
  useSeoMeta({
    ogImage: ogImageUrl,
    ogImageSecureUrl: ogImageUrl,
    twitterImage: ogImageUrl,
  });
}

const canonicalUrl = useAbsoluteSiteUrl(route.path);
if (canonicalUrl) {
  useHead({
    link: [{ rel: 'canonical', href: canonicalUrl }],
  });
}

const { data, pending, error } = await useFetch<TournamentResponse>('/api/tournament', {
  key: 'tournament',
  transform: (d) => normalizeTournamentResponse(d as TournamentResponse),
});

const publicTab = ref<'group1' | 'group2' | 'knockout' | 'drinks'>('group1');

const groupSections = computed(() => {
  const groups = data.value?.groups;
  if (!groups) {
    return [] as { key: string; title: string; matches: TournamentMatch[] }[];
  }
  return Object.keys(groups)
    .sort()
    .map((key) => {
      const raw = groups[key];
      if (!raw?.length) {
        return { key, title: `Groep ${key.toUpperCase()}`, matches: [] as TournamentMatch[] };
      }
      const matches = [...raw].sort((a, b) => a.order - b.order);
      const first = matches[0];
      const title = first ? groupHeading(first.round, key) : `Groep ${key.toUpperCase()}`;
      return { key, title, matches };
    });
});

const groupSection1 = computed(() => groupSections.value[0] ?? null);
const groupSection2 = computed(() => groupSections.value[1] ?? null);

function groupHeading(round: string, key: string) {
  const m = round.match(/^group\s+(.+)$/i);
  const suffix = m?.[1];
  if (suffix) {
    return `Groep ${suffix.toUpperCase()}`;
  }
  return `Groep ${key.toUpperCase()}`;
}

function standingsRowsForPouleKey(apiKey: string | undefined): StandingRow[] {
  if (!apiKey || !data.value?.standings?.[apiKey]) return [];
  return [...data.value.standings[apiKey]].sort((a, b) => a.rank - b.rank);
}

const standingsRowsGroup1 = computed(() => standingsRowsForPouleKey(groupSection1.value?.key));
const standingsRowsGroup2 = computed(() => standingsRowsForPouleKey(groupSection2.value?.key));

const sidebarStandings = computed(() => data.value?.standings ?? {});

const knockoutSections = computed(() => {
  const t = data.value;
  if (!t) return [] as { key: string; title: string; matches: TournamentMatch[] }[];
  const out: { key: string; title: string; matches: TournamentMatch[] }[] = [];
  if (t.lastPlace) {
    out.push({ key: 'last-place', title: 'Laatste plaats', matches: [t.lastPlace] });
  }
  if (t.quarterFinal?.length) {
    out.push({
      key: 'quarter',
      title: 'Kwartfinale',
      matches: [...t.quarterFinal].sort((a, b) => a.order - b.order),
    });
  }
  if (t.semiFinal?.length) {
    out.push({
      key: 'semi',
      title: 'Halve finale',
      matches: [...t.semiFinal].sort((a, b) => a.order - b.order),
    });
  }
  if (t.final) {
    out.push({ key: 'final', title: 'Finale', matches: [t.final] });
  }
  return out;
});

watch(
  groupSection2,
  (g2) => {
    if (!g2 && publicTab.value === 'group2') {
      publicTab.value = 'group1';
    }
  },
  { flush: 'post' },
);
</script>

<style scoped>
.speelschema {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.speelschema__main {
  flex: 1;
  padding: 24px var(--layout-pad) 40px;
}

.speelschema__layout {
  max-width: var(--layout-max);
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(240px, 300px);
  gap: 24px;
  align-items: start;
}

.speelschema__schedule {
  min-width: 0;
}

.schedule-tab-panel {
  min-height: 120px;
  min-width: 0;
}

.drinks-panel--first {
  margin-top: 0;
}

.schedule-card--first-in-panel {
  margin-top: 0;
}

.schedule-empty {
  margin: 0;
  padding: 20px 16px;
  text-align: center;
  font-weight: 600;
  color: #6b7280;
  background: var(--color-card);
  border-radius: 14px;
  border: 1px solid rgba(26, 77, 46, 0.1);
}

.schedule-card {
  min-width: 0;
  background: var(--color-card);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(15, 51, 31, 0.1);
  border: 1px solid rgba(26, 77, 46, 0.1);
}

.schedule-card--spaced + .schedule-card--spaced {
  margin-top: 20px;
}

.schedule-card__games {
  min-width: 0;
  padding: 0;
}

.standings-table-wrap {
  overflow-x: auto;
}

.standings-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  line-height: 1.45;
}

.standings-table thead th {
  font-weight: 700;
  color: var(--color-forest-dark);
  background: rgba(26, 77, 46, 0.07);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 14px 12px 12px;
  text-align: left;
  border-bottom: 2px solid rgba(26, 77, 46, 0.12);
  vertical-align: bottom;
}

.standings-table tbody td {
  padding: 15px 12px;
  text-align: left;
  border-bottom: 1px solid #e8ebe8;
  vertical-align: middle;
}

.standings-table tbody tr:last-child td {
  border-bottom: none;
}

.standings-table tbody tr:hover td {
  background: rgba(26, 77, 46, 0.03);
}

.standings-table__th-num,
.standings-table__num {
  text-align: center;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.standings-table thead th.standings-table__th-num {
  text-align: center;
  padding-left: 10px;
  padding-right: 10px;
}

.standings-table tbody td.standings-table__num {
  text-align: center;
  padding-left: 10px;
  padding-right: 10px;
}

/* Rank */
.standings-table__th-num:first-child,
.standings-table__num:first-child {
  min-width: 2.75rem;
  width: 3rem;
}

/* Team column — extra ruimte */
.standings-table thead th:nth-child(2),
.standings-table tbody td:nth-child(2) {
  min-width: 8.5rem;
  padding-left: 16px;
  padding-right: 20px;
}

/* Statistiekkolommen — vaste minimale breedte */
.standings-table thead th.standings-table__th-num:not(:first-child),
.standings-table tbody td.standings-table__num:not(:first-child):not(.standings-table__num--pts) {
  min-width: 2.65rem;
}

.standings-table__th-num--pts {
  color: var(--color-forest);
}

.standings-table__th-num--pts,
.standings-table__num--pts {
  min-width: 2.85rem;
}

.standings-table__team {
  font-weight: 600;
  color: #1f2937;
}

.standings-table__num--pts {
  font-weight: 700;
  color: var(--color-forest);
}

@media (max-width: 640px) {
  .standings-table .standings-table__col--hide-mobile {
    display: none;
  }
}

.schedule-state {
  margin: 0;
  padding: 24px;
  text-align: center;
  font-weight: 600;
  color: var(--color-forest-dark);
}

.schedule-state--error {
  color: #b91c1c;
}

@media (max-width: 900px) {
  .speelschema__layout {
    grid-template-columns: 1fr;
  }

  .speelschema__sidebar {
    order: -1;
  }
}
</style>
