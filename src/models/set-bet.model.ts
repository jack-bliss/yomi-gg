import { BetOutcome } from '../types/bet-outcome.type';

export class SetBet {

  id: number;
  profile_id: number;
  match_id: number;
  prediction: number;
  wager: number;
  outcome: BetOutcome;

  constructor(input: any) {

    this.id = input.id;
    this.profile_id = input.profile_id;
    this.match_id = input.match_id;
    this.prediction = input.prediction;
    this.wager = input.wager;
    this.outcome = input.outcome;

  }

}