export class Event {

  id: number;
  phase_group: number;
  name: string;
  slug: string;

  constructor(input: any) {

    this.id = input.id;
    this.phase_group = input.phase_group;
    this.name = input.name;
    this.slug = input.slug;

  }

}