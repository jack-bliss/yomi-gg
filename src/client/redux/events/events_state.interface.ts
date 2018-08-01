import { Match } from "../../../models/match.model";
import { Event } from '../../../models/event.model';

export interface EventsState {
  fetching: 'events' | 'matches' | 'none';
  focused: number;
  events: Event[];
  event_matches: {
    [key: number]: Match[];
  }
}