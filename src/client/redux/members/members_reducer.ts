import { MembersState } from './members_state.interface';
import { MembersAction } from './members_actions';

const MembersIntialState: MembersState = {
  profiles: [],
  profiles_biggest_return: [],
  profiles_total_return_from_event: [],
  event_returning: null,
}

export const MembersReducer = (state: MembersState = MembersIntialState, action: MembersAction): MembersState => {
  return state;
}