import { Profile } from "../../../models/profile.model";
import { MemberCoins } from '../../components/coin-display';
import { Event } from "../../../models/event.model";

export interface MembersState {

  profiles: Profile[];
  profiles_biggest_return: MemberCoins[];
  profiles_total_return_from_event: MemberCoins[];
  event_returning: Event;

}