export class Match {
  id: number;
  set_id: number;
  entrant1id: number;
  entrant2id: number;
  state: string;
  winner: number;
  entrant1score: number;
  entrant2score: number;
  event_id: number;
  entrant1tag: string;
  entrant2tag: string;
  round: string;
  highlight: number;

  constructor(input: any) {

    this.id = input.id;
    this.set_id = input.set_id;
    this.entrant1id = input.entrant1Id;
    this.entrant2id = input.entrant2Id;
    this.state = input.state;
    this.winner = input.winner;
    this.entrant1score = input.entrant1score;
    this.entrant2score = input.entrant2score;
    this.entrant1tag = input.entrant1tag;
    this.entrant2tag = input.entrant2tag;
    this.event_id = input.event_id;
    this.round = input.round;
    this.highlight = input.highlight;

  }
}