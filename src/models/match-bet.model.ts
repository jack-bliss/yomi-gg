import { BetOutcome } from '../types/bet-outcome.type';

export class MatchBet {

  id: number;
  profile_id: number;
  set_id: number;
  prediction: number;
  wager: number;
  outcome: BetOutcome;

  constructor(input: any) {

    this.id = input.id;
    this.profile_id = input.profile_id;
    this.set_id = input.set_id;
    this.prediction = input.prediction;
    this.wager = input.wager;
    this.outcome = input.outcome;

  }

}