import { SmashggImage } from './smashgg-image.interface';

export interface SmashggRankingSeries {

  id: number;
  videogameId: number;
  locationName: string;
  name: string;
  images: SmashggImage[];

}