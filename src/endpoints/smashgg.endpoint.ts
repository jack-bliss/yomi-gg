import { Path, GET, PathParam, POST, FormParam, ContextRequest, Preprocessor } from 'typescript-rest';
import { GetTournament, SmashggTournamentEntities } from '../smashgg/get-tournament';
import { SmashggSet } from '../interfaces/smashgg/smashgg-set.interface';
import { GetGroupSets, SmashggGroupSetsEntities } from '../smashgg/get-group-sets';
import { GetSet } from '../smashgg/get-set';
import { Event } from '../models/event.model';
import { RequestExtended } from '../interfaces/request-extended.interface';
import { AdminPreprocessor } from '../preprocessors/admin.preprocessor';

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

  @Path('/import/')
  @POST
  @Preprocessor(AdminPreprocessor)
  importTournament(
    @FormParam('tournament') tournament: string,
    @FormParam('group_id') group_id: number,
    @ContextRequest { pool }: RequestExtended,
  ): Promise<Event> {

    let eventName: string, eventId: number;
    const players: { [key: number]: string } = {};

    return GetTournament(tournament).then(STE => {

      eventName = STE.tournament.name;
      STE.entrants.forEach(e => {
        players[e.id] = e.name;
      });

      const eventQuery = 'INSERT INTO events (phase_group, name, slug) VALUES (' +
        group_id + ', ' +
        '\'' + eventName + '\', ' +
        '\'' + tournament + '\') RETURNING id';

      return pool.query(eventQuery)


    }).then((eventResult) => {

      eventId = eventResult.rows[0].id;

      return GetGroupSets(group_id)

    }).then(SGSE => {

      const insertSetsQuery = 'INSERT INTO matches (' +
        'set_id, ' +
        'entrant1id, ' +
        'entrant2id, ' +
        'eventid, ' +
        'entrant1tag, ' +
        'entrant2tag' +
        ') SELECT * FROM UNNEST ($1::int[], $2::int[], $3::int[], $4::int[], $5::text[], $6::text[])';

      const setData = SGSE.sets.reduce((acc, set) => {

        if (set.entrant1Id !== null  && set.entrant2Id !== null) {

          console.log('==set==');
          console.log(set.id, set.entrant1Id, set.entrant2Id, eventId);
          return [
            [...acc[0], set.id,],
            [...acc[1], set.entrant1Id],
            [...acc[2], set.entrant2Id],
            [...acc[3], eventId],
            [...acc[4], players[set.entrant1Id]],
            [...acc[5], players[set.entrant2Id]],
          ];
        } else {
          return acc;
        }

      }, [[], [], [], [], [], []]);

      return pool.query(insertSetsQuery, setData);


    }).then(() => {

      return Promise.resolve(new Event({
        id: eventId,
        name: eventName,
        phase_group: group_id,
        slug: tournament,
      }));

    });

  }

}