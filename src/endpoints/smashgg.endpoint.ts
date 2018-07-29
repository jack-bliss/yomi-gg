import { Path, GET, PathParam, POST, FormParam, ContextRequest, Preprocessor, Errors } from 'typescript-rest';
import { GetTournament, SmashggTournamentEntities } from '../smashgg/get-tournament';
import { SmashggSet } from '../interfaces/smashgg/smashgg-set.interface';
import { GetGroupSets, SmashggGroupSetsEntities } from '../smashgg/get-group-sets';
import { GetSet } from '../smashgg/get-set';
import { Event } from '../models/event.model';
import { RequestExtended } from '../interfaces/request-extended.interface';
import { AdminPreprocessor } from '../preprocessors/admin.preprocessor';
import { UpdateTournament } from '../smashgg/update-tournament';
import { ImportTournament } from '../smashgg/import-tournament';

@Path('/smashgg')
@Preprocessor(AdminPreprocessor)
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

  @Path('/import')
  @POST
  importTournament(
    @FormParam('tournament') tournament: string,
    @FormParam('group_id') group_id: string,
    @ContextRequest { pool }: RequestExtended,
  ): Promise<Event> {

    return ImportTournament(tournament, group_id, pool);

  }

  @Path('/update-event')
  @POST
  updateTournament(
    @FormParam('id') id: number,
    @ContextRequest { pool }: RequestExtended,
  ): Promise<void> {

    throw new Errors.NotImplementedError('Manual updating is under construction');

  }

}