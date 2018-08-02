import { EventsState } from "./events_state.interface";
import { EventsAction, EventsActionType } from "./events_actions";

const EventsInitialState: EventsState = {
  fetching: 'none',
  displaying: 'none',
  focused: null,
  events: [],
  event_matches: { },
  event_breakdown: { }, 
}

export const EventsReducer = (state: EventsState = EventsInitialState, action: EventsAction): EventsState => {
  console.log('=== === ===');
  console.log('dispatching action', action.type);
  console.log('full data:', action);
  switch (action.type) {
    case EventsActionType.FETCHING_EVENTS:
      return {
        ...state,
        fetching: 'events',
      };
    case EventsActionType.EVENTS_FETCHED:
      return {
        ...state,
        fetching: 'none',
        events: action.events,
      };
    case EventsActionType.FETCHING_EVENT_MATCHES:
      return {
        ...state,
        fetching: 'matches',
      };
    case EventsActionType.EVENT_MATCHES_FETCHED:
      return {
        ...state,
        fetching: 'none',
        displaying: 'matches',
        event_matches: {
          ...state.event_matches,
          [action.event_id]: action.matches,
        },
      };
    case EventsActionType.FOCUS_EVENT:
      return {
        ...state,
        focused: action.event_id,
      };
    case EventsActionType.FETCHING_EVENT_BREAKDOWN:
      return {
        ...state,
        fetching: 'breakdown',
      };
    case EventsActionType.EVENT_BREAKDOWN_FETCHED:
      return {
        ...state,
        fetching: 'none',
        displaying: 'breakdown',
        event_breakdown: {
          ...state.event_breakdown,
          [action.event_id]: action.breakdown,
        }
      }
  }

  return state;
}