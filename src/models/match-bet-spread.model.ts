import { State } from "../types/state.type";

export class MatchBetSpread {

  round: string;
  state: State;  
  entrants: {
    score: number;
    tag: string;
    id: number;
    backing: number;
    is_winner: boolean;
  }[];

}