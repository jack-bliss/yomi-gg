import { Match } from '../../../models/match.model';
import { Event } from '../../../models/event.model';
import { MatchBetSpread } from '../../../models/match-bet-spread.model';

export enum EventsActionType {
  FETCHING_EVENTS = 'events/FETCHING_EVENTS',
  EVENTS_FETCHED = 'events/EVENTS_FETCHED',
  FETCHING_EVENT_MATCHES = 'events/FETCHING_EVENT_MATCHES',
  EVENT_MATCHES_FETCHED = 'events/EVENT_MATCHES_FETCHED',
  FOCUS_EVENT = 'events/FOCUS_EVENT',
  FETCHING_EVENT_BREAKDOWN = 'events/FETCHING_EVENT_BREAKDOWN',
  EVENT_BREAKDOWN_FETCHED = 'events/EVENT_BREAKDOWN_FETCHED',
}

interface FetchingEvents { type: EventsActionType.FETCHING_EVENTS };
export function fetchingEvents(): FetchingEvents {
  return {
    type: EventsActionType.FETCHING_EVENTS,
  }
}

interface EventsFetched { type: EventsActionType.EVENTS_FETCHED; events: Event[] };
export function eventsFetched(events: Event[]): EventsFetched {
  return {
    type: EventsActionType.EVENTS_FETCHED,
    events,
  }
}

interface FetchingEventMatches { type: EventsActionType.FETCHING_EVENT_MATCHES };
export function fetchingEventMatches(): FetchingEventMatches {
  return {
    type: EventsActionType.FETCHING_EVENT_MATCHES,
  }
}

interface EventMatchesFetched { 
  type: EventsActionType.EVENT_MATCHES_FETCHED;
  event_id: number;
  matches: Match[];
}
export function eventMatchesFetched(event_id: number, matches: Match[]): EventMatchesFetched {
  return {
    type: EventsActionType.EVENT_MATCHES_FETCHED,
    event_id,
    matches,
  }
}

interface FocusEvent {
  type: EventsActionType.FOCUS_EVENT;
  event_id: number;
}
export function focusEvent(event_id: number): FocusEvent {
  return {
    type: EventsActionType.FOCUS_EVENT,
    event_id,
  }
}

interface FetchingEventBreakdown {
  type: EventsActionType.FETCHING_EVENT_BREAKDOWN;
}
export function fetchingEventBreakdown(): FetchingEventBreakdown {
  return {
    type: EventsActionType.FETCHING_EVENT_BREAKDOWN,
  }
}

interface EventBreakdownFetched {
  type: EventsActionType.EVENT_BREAKDOWN_FETCHED;
  event_id: number;
  breakdown: MatchBetSpread[];
}
export function eventBreakdownFetched(event_id: number, breakdown: MatchBetSpread[]): EventBreakdownFetched {
  return {
    type: EventsActionType.EVENT_BREAKDOWN_FETCHED,
    event_id,
    breakdown,
  }
}

export type EventsAction = FetchingEvents 
| EventsFetched 
| FetchingEventMatches 
| EventMatchesFetched
| FocusEvent
| FetchingEventBreakdown
| EventBreakdownFetched;