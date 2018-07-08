export class Event {

  id: number;
  phase_group: number;
  name: string;
  slug: string;
  image: string;
  starting: string;
  state: 'pending' | 'in progress' | 'finished';

  constructor(input: any) {

    this.id = input.id;
    this.phase_group = input.phase_group;
    this.name = input.name;
    this.slug = input.slug;
    this.image = input.image;
    this.starting = input.starting;
    this.state = input.state;

  }

}