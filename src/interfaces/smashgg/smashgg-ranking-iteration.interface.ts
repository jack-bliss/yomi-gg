import { SmashggImage } from './smashgg-image.interface';

export interface SmashggRankingIteration {

  id: number;
  seriesId: number;
  title: string;
  active: boolean;
  images: SmashggImage[];

}