import { State } from '../types/state.type';

export class Event {

  id: number;
  phase_group: string;
  name: string;
  slug: string;
  image: string;
  starting: string;
  state: State;
  smashgg_id: number;

  constructor(input: any) {

    this.id = input.id;
    this.phase_group = input.phase_group;
    this.name = input.name;
    this.slug = input.slug;
    this.image = input.image;
    this.starting = input.starting;
    this.state = input.state;
    this.smashgg_id = input.smashgg_id;

  }

}