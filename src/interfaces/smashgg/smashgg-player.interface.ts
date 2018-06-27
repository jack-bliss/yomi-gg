import { SmashggPlayerRanking } from './smashgg-player-ranking.interface';
import { SmashggImage } from './smashgg-image.interface';

export interface SmashggPlayer {

  id: number;
  gamerTag: string;
  prefix: string;
  name: string;
  twitterHandle: string;
  country: string;
  entrantId: string;
  rankings: SmashggPlayerRanking[];
  images: SmashggImage[];

}