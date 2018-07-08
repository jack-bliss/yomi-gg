import { SmashggImage } from './smashgg-image.interface';

export interface SmashggTournament {
  id: number;
  name: string;
  slug: string;
  shortSlug: string;
  timezone: string;
  links: { [key: string]: string };
  hashtag: string;
  details: string;
  images: SmashggImage[];
  startAt: number;
}