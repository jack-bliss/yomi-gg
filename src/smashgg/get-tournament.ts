import * as request from 'request-promise-native';
import { SmashggTournament } from '../interfaces/smashgg/smashgg-tournament.interface';
import { SmashggPhase } from '../interfaces/smashgg/smashgg-phase.interface';
import { SmashggGroup } from '../interfaces/smashgg/smashgg-group.interface';
import { SmashggEntrant } from '../interfaces/smashgg/smashgg-entrant.interface';
import { SmashggPlayer } from '../interfaces/smashgg/smashgg-player.interface';
import { SmashggRankingSeries } from '../interfaces/smashgg/smashgg-ranking-series.interface';
import { SmashggRankingIteration } from '../interfaces/smashgg/smashgg-ranking-iteration.interface';
import { SmashggResponse } from '../interfaces/smashgg/smashgg-response.interface';

export interface SmashggTournamentEntities {
  tournament: SmashggTournament;
  phase: SmashggPhase[];
  groups: SmashggGroup[];
  entrants: SmashggEntrant[];
  players: SmashggPlayer[];
  rankingSeries: SmashggRankingSeries[];
  rankingIterations: SmashggRankingIteration[];
}

export const GetTournament = (tournament: string): Promise<SmashggTournamentEntities> => {

  return new Promise((resolve, reject) => {
    request({
      uri: 'https://api.smash.gg/tournament/' + tournament + '?expand[]=phase&expand[]=groups&expand[]=entrants',
      json: true,
    }).then((json: SmashggResponse<SmashggTournamentEntities>) => {
      resolve(json.entities);
    }, err => {
      reject(err);
    })
  });

};