export class Match {
  id: number;
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
  round_order: number;

  constructor(input: any) {

    this.id = input.id;
    this.entrant1id = input.entrant1id;
    this.entrant2id = input.entrant2id;
    this.state = input.state;
    this.winner = input.winner;
    this.entrant1score = input.entrant1score;
    this.entrant2score = input.entrant2score;
    this.entrant1tag = input.entrant1tag;
    this.entrant2tag = input.entrant2tag;
    this.event_id = input.event_id;
    this.round = input.round;
    this.highlight = input.highlight;
    this.round_order = input.round_order;

  }
}