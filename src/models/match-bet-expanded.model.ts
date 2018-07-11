import { BetOutcome } from '../types/bet-outcome.type';

export class MatchBetExpanded {

  prediction: number;
  wager: number;
  outcome: BetOutcome;
  winnings: number;

  entrant1id: number;
  entrant2id: number;
  entrant1tag: string;
  entrant2tag: string;
  round: string;
  round_order: number;

  tournament: string;

  constructor(input: any) {

    this.prediction = input.prediction;
    this.wager = input.wager;
    this.outcome = input.outcome;

    this.entrant1id = input.entrant1id;
    this.entrant2id = input.entrant2id;
    this.entrant1tag = input.entrant1tag;
    this.entrant2tag = input.entrant2tag;
    this.round = input.round;
    this.round_order = input.round_order;

    this.tournament = input.tournament;
    if (this.outcome === 'pending') {
      this.winnings = null;
    } else if (this.outcome === 'win') {
      this.winnings = this.wager;
    } else if (this.outcome === 'loss') {
      this.winnings = 0;
    }

  }

}