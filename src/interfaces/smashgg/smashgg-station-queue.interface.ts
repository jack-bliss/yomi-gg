import { SmashggResponse } from './smashgg-response.interface';
import { SmashggSet } from './smashgg-set.interface';
import { SmashggGroup } from './smashgg-group.interface';
import { SmashggPhase } from './smashgg-phase.interface';
import { SmashggStream } from './smashgg-stream.interface';
import { SmashggEntrant } from './smashgg-entrant.interface';
import { SmashggPlayer } from './smashgg-player.interface';
import { SmashggRankingSeries } from './smashgg-ranking-series.interface';
import { SmashggRankingIteration } from './smashgg-ranking-iteration.interface';

export interface SmashggStationQueue {
  sets: SmashggSet[];
  stat: any[];
  groups: SmashggGroup[];
  phase: SmashggPhase[];
  stream: SmashggStream[];
  entrants: SmashggEntrant[];
  player: SmashggPlayer[];
  rankingSeries: SmashggRankingSeries[];
  rankingIteration: SmashggRankingIteration[];
}

export interface SmashggStationQueueResponse {
  queues: { [key: string]: number[] };
  tournamentId: number;
  data: SmashggResponse<any>;
  actionRecords: any[];
}