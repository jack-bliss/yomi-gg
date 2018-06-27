import { Path, GET, PathParam } from 'typescript-rest';
import { GetTournament, SmashggTournamentEntities } from '../smashgg/get-tournament';
import { SmashggSet } from '../interfaces/smashgg/smashgg-set.interface';
import { GetGroupSets, SmashggGroupSetsEntities } from '../smashgg/get-group-sets';
import { GetSet } from '../smashgg/get-set';

@Path('/smashgg')
export class SmashggEndpoint {

  @Path('/tournament/:tournament')
  @GET
  getTournament(
    @PathParam('tournament') tournament: string,
  ): Promise<SmashggTournamentEntities> {
    return GetTournament(tournament);
  }

  @Path('/group/:group_id')
  @GET
  getGroupWithSets(
    @PathParam('group_id') group_id: number,
  ): Promise<SmashggGroupSetsEntities> {
    return GetGroupSets(group_id);
  }

  @Path('/set/:set_id')
  @GET
  getSet(
    @PathParam('set_id') set_id: number,
  ): Promise<SmashggSet> {
    return GetSet(set_id);
  }

}