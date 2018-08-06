import { combineReducers, createStore } from 'redux';
import { EventsReducer } from './events/events_reducer';
import { EventsState } from './events/events_state.interface';
import { MembersState } from './members/members_state.interface';
import { MembersReducer } from './members/members_reducer';

export interface RootState {
  events: EventsState;
  members: MembersState;
}

const rootReducer = combineReducers<RootState>({
  events: EventsReducer,
  members: MembersReducer,
});

export const store = createStore(rootReducer);