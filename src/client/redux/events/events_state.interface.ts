import { Match } from "../../../models/match.model";
import { Event } from '../../../models/event.model';
import { MatchBetSpread } from '../../../models/match-bet-spread.model';

export interface EventsState {
  fetching: 'events' | 'matches' | 'none' | 'breakdown';
  focused: number;
  displaying: 'matches' | 'breakdown' | 'none';
  events: Event[];
  event_matches: {
    [key: number]: Match[];
  };
  event_breakdown: {
    [key: number]: MatchBetSpread[];
  };
}