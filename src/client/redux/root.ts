import { combineReducers, createStore } from 'redux';
import { EventsReducer } from './events/events_reducer';
import { EventsState } from './events/events_state.interface';

const rootReducer = combineReducers({
  events: EventsReducer,
});

export interface RootState {
  events: EventsState;
}

export const store = createStore(rootReducer);