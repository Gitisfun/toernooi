import type { TournamentMatch } from '~/types/tournament';

export type GroupScheduleRow = { type: 'match'; match: TournamentMatch } | { type: 'middagpauze' };

/** Na de 5e wedstrijd een middagpauze als 6e rij; alleen als er minstens vijf wedstrijden zijn. */
export function groupMatchesWithMiddagPauze(matches: TournamentMatch[]): GroupScheduleRow[] {
  if (matches.length < 5) {
    return matches.map((match) => ({ type: 'match', match }));
  }
  const rows: GroupScheduleRow[] = [];
  for (let i = 0; i < matches.length; i++) {
    rows.push({ type: 'match', match: matches[i] });
    if (i === 4) {
      rows.push({ type: 'middagpauze' });
    }
  }
  return rows;
}
