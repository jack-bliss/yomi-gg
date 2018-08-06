import { Profile } from '../../../models/profile.model';
import { MemberCoins } from '../../components/coin-display';

export enum MembersActionType {
  FETCHING_ALL_PROFILES = 'members/FETCHING_ALL_PROFILES',
  ALL_PROFILES_FETCHED = 'members/ALL_PROFILES_FETCHED',
  FETCHING_BIGGEST_RETURN = 'members/FETCHING_BIGGEST_RETURN',
  BIGGEST_RETURN_FETCHED = 'members/BIGGEST_RETURN_FETCHED',
  FETCHING_RETURN_FROM_EVENT = 'members/FETCHING_RETURN_FROM_EVENT',
  RETURN_FROM_EVENT_FETCHED = 'members/RETURN_FROM_EVENT_FETCHED',
}

interface FetchingAllProfiles {
  type: MembersActionType.FETCHING_ALL_PROFILES,
}
export function fetchingAllProfiles(): FetchingAllProfiles {
  return {
    type: MembersActionType.FETCHING_ALL_PROFILES,
  }
}

interface AllProfilesFetched {
  type: MembersActionType.ALL_PROFILES_FETCHED,
  profiles: Profile[],
}
export function allProfilesFetched(profiles: Profile[]) {
  return {
    type: MembersActionType.ALL_PROFILES_FETCHED,
    profiles,
  }
}

interface FetchingBiggestReturn {
  type: MembersActionType.FETCHING_BIGGEST_RETURN,
}
export function fetchingBiggestReturn(): FetchingBiggestReturn {
  return {
    type: MembersActionType.FETCHING_BIGGEST_RETURN,
  }
}

interface BiggestReturnFetched {
  type: MembersActionType.BIGGEST_RETURN_FETCHED,
  members: MemberCoins[],
}
export function biggestReturnFetched(members: MemberCoins[]): BiggestReturnFetched {
  return {
    type: MembersActionType.BIGGEST_RETURN_FETCHED,
    members,
  }
}


export type MembersAction = FetchingAllProfiles
  | AllProfilesFetched
  | FetchingBiggestReturn
  | BiggestReturnFetched;