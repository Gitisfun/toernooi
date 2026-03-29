export interface TournamentTeam {
  id: string;
  name: string;
  group: string;
}

/** GET /api/drinks — drankregistratie per team */
export interface DrinkRow {
  id: string;
  team: TournamentTeam;
  amount: number;
}

export interface TournamentMatch {
  id: string;
  /** Ontbreekt voor knockout-placeholders tot teams bekend zijn. */
  homeTeam: TournamentTeam | null;
  /** Ontbreekt voor knockout-placeholders tot teams bekend zijn. */
  awayTeam: TournamentTeam | null;
  homeTeamScore: number | null;
  awayTeamScore: number | null;
  penaltyHomeTeamScore: number | null;
  penaltyAwayTeamScore: number | null;
  round: string;
  order: number;
  startHour: string;
  endHour: string;
  /** Optioneel: terrein / veld (alleen tonen als de API het meestuurt). */
  terrain?: string | null;
  /** Optioneel: extra toelichting (alleen tonen als de API het meestuurt). */
  description?: string | null;
}

/** Poule-stand per team (API veld `standings`) */
export interface StandingRow {
  rank: number;
  team: TournamentTeam;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface TournamentResponse {
  groups: Record<string, TournamentMatch[]>;
  standings?: Record<string, StandingRow[]>;
  /** Eén wedstrijd om laatste plaats / kleine finale */
  lastPlace?: TournamentMatch | null;
  quarterFinal?: TournamentMatch[];
  semiFinal?: TournamentMatch[];
  final?: TournamentMatch | null;
}

/** POST /tournament/order — match ids per group in display order */
export interface TournamentOrderRequest {
  groups: Record<string, string[]>;
}

export function matchSideLabel(team: TournamentTeam | null | undefined): string {
  return team?.name?.trim() ? team.name : 'Nog te bepalen';
}

function isTeamObject(v: unknown): v is TournamentTeam {
  if (v === null || typeof v !== 'object' || Array.isArray(v)) {
    return false;
  }
  const t = v as Record<string, unknown>;
  return typeof t.id === 'string' && typeof t.name === 'string' && typeof t.group === 'string';
}

function isTeamOrNull(v: unknown): v is TournamentTeam | null {
  return v === null || isTeamObject(v);
}

/** Echte wedstrijd of knockout-placeholder (teams mogen nog `null` zijn). Geen lege `{}`. */
export function isLikelyMatch(v: unknown): v is TournamentMatch {
  if (v === null || v === undefined || typeof v !== 'object' || Array.isArray(v)) {
    return false;
  }
  const o = v as Record<string, unknown>;
  if (typeof o.id !== 'string') {
    return false;
  }
  return isTeamOrNull(o.homeTeam) && isTeamOrNull(o.awayTeam);
}

/** Vult ontbrekende velden; negeert lege `{}` voor lastPlace/final. */
export function normalizeTournamentResponse(raw: TournamentResponse): TournamentResponse {
  const groups = raw.groups ?? {};
  const standings = raw.standings ?? {};
  const quarterFinal = [...(raw.quarterFinal ?? [])];
  const semiFinal = [...(raw.semiFinal ?? [])];
  const lastPlace = isLikelyMatch(raw.lastPlace) ? raw.lastPlace : undefined;
  const final = isLikelyMatch(raw.final) ? raw.final : undefined;
  return {
    ...raw,
    groups,
    standings,
    quarterFinal,
    semiFinal,
    lastPlace,
    final,
  };
}
