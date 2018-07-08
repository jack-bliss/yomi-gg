import { Path, GET, PathParam, POST, FormParam, ContextRequest, Preprocessor, Errors } from 'typescript-rest';
import { GetTournament, SmashggTournamentEntities } from '../smashgg/get-tournament';
import { SmashggSet } from '../interfaces/smashgg/smashgg-set.interface';
import { GetGroupSets, SmashggGroupSetsEntities } from '../smashgg/get-group-sets';
import { GetSet } from '../smashgg/get-set';
import { Event } from '../models/event.model';
import { RequestExtended } from '../interfaces/request-extended.interface';
import { AdminPreprocessor } from '../preprocessors/admin.preprocessor';
import { SmashggTournament } from '../interfaces/smashgg/smashgg-tournament.interface';
import { Match } from '../models/match.model';
import { PoolClient } from 'pg';

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

  @Path('/import/')
  @POST
  importTournament(
    @FormParam('tournament') tournament: string,
    @FormParam('group_id') group_id: number,
    @ContextRequest { pool }: RequestExtended,
  ): Promise<Event> {

    let eventName: string, eventId: number, image: string, starting: Date;
    const players: { [key: number]: string } = {};

    return GetTournament(tournament).then(STE => {

      const T: SmashggTournament = STE.tournament;
      eventName = T.name;
      image = T.images[0].url;
      starting = new Date(T.startAt * 1000);
      STE.entrants.forEach(e => {
        players[e.id] = e.name;
      });

      const eventQuery = 'INSERT INTO events (phase_group, name, slug, image, starting) VALUES (' +
        '$1, ' +
        '$2::text, ' +
        '$3::text, ' +
        '$4::text, ' +
        '$5' +
        ') RETURNING id';

      return pool.query(
        eventQuery,
        [group_id, eventName, tournament, image, starting],
      )


    }).then((eventResult) => {

      eventId = eventResult.rows[0].id;

      return GetGroupSets(group_id)

    }).then(SGSE => {

      const insertSetsQuery = 'INSERT INTO matches (' +
          'set_id, ' +
          'entrant1id, ' +
          'entrant2id, ' +
          'event_id, ' +
          'entrant1tag, ' +
          'entrant2tag, ' +
          'round, ' +
          'round_order, ' +
          'identifier' +
        ') SELECT * FROM UNNEST (' +
          '$1::text[], ' +
          '$2::int[], ' +
          '$3::int[], ' +
          '$4::int[], ' +
          '$5::text[], ' +
          '$6::text[], ' +
          '$7::text[], ' +
          '$8::int[], ' +
          '$9::text[]' +
        ')';

      const realSets: SmashggSet[] = SGSE.sets
        .filter(set => set.entrant1PrereqType !== 'bye'  && set.entrant2PrereqType !== 'bye');

      const grandFinals: SmashggSet[] = realSets
        .filter(s => s.fullRoundText === 'Grand Final')
        .sort((a, b) => a.previewOrder - b.previewOrder)
        .map((s, i) => ({
          ...s,
          round: i === 0 ? s.round : s.round + 1,
          fullRoundText: i === 0 ? 'Grand Final' : 'Grand Final (Bracket Reset)',
        }));
      const notGrandFinals: SmashggSet[] = realSets.filter(s => s.fullRoundText !== 'Grand Final');

      const orderReady: SmashggSet[] = [...grandFinals, ...notGrandFinals]
        .map((set: SmashggSet) => ({
          ...set,
          round: set.round > 0 ? (set.round * 3) - 2 : Math.ceil((set.round * -3) / 2),
        }));

      const setData: (number | string)[][] = orderReady.reduce((acc, set) => {

        console.log('==set==');
        console.log(set.id, set.entrant1Id, set.entrant2Id, eventId);
        return [
          [...acc[0], set.id,],
          [...acc[1], set.entrant1Id],
          [...acc[2], set.entrant2Id],
          [...acc[3], eventId],
          [...acc[4], set.entrant1Id ? players[set.entrant1Id] : 'Pending'],
          [...acc[5], set.entrant2Id ? players[set.entrant2Id] : 'Pending'],
          [...acc[6], set.fullRoundText],
          [...acc[7], set.round],
          [...acc[8], set.identifier],
        ];

      }, [[], [], [], [], [], [], [], [], []]);

      return pool.query(insertSetsQuery, setData);


    }).then(() => {

      return Promise.resolve(new Event({
        id: eventId,
        name: eventName,
        phase_group: group_id,
        slug: tournament,
        image: image,
        starting: starting,
      }));

    });

  }

  @Path('/update-event/')
  @POST
  updateTournament(
    @FormParam('id') id: number,
    @ContextRequest { pool }: RequestExtended,
  ): Promise<void> {

    const players: { [key: number]: string } = {};
    let sets: SmashggSet[] = [];

    const eventQuery = 'SELECT phase_group, slug FROM events WHERE id=' + id;

    return pool.query(eventQuery).then(response => {

      const group_id = response.rows[0].phase_group;
      const tournament = response.rows[0].slug;

      return Promise.all([GetGroupSets(group_id), GetTournament(tournament)]);

    }, err => {
      console.error('couldnt get event');
      console.error(err);
    }).then((response: [SmashggGroupSetsEntities, SmashggTournamentEntities]) => {

      sets = response[0].sets;

      response[1].entrants.forEach(e => {
        players[e.id] = e.name;
      });

      return pool.connect();

    }, err => {
      console.error('couldnt get stuff from smashgg');
      console.error(err);
    }).then((client: PoolClient) => {

      const tempTable = 'CREATE TEMP TABLE updates (' +
        'set_id VARCHAR(20), ' +
        'identifier VARCHAR(2), ' +
        'entrant1id NUMERIC(10, 0), ' +
        'entrant2id NUMERIC(10, 0), ' +
        'entrant1tag VARCHAR(100), ' +
        'entrant2tag VARCHAR(100), ' +
        'winner NUMERIC(10, 0), ' +
        'entrant1Score NUMERIC(2, 0), ' +
        'entrant2Score NUMERIC(2, 0)' +
      '); ';


      return client.query(tempTable)
        .then(r => {

          const updateTempTable = 'INSERT INTO updates (' +
            'set_id, ' +
            'identifier, ' +
            'entrant1id, ' +
            'entrant2id, ' +
            'entrant1tag, ' +
            'entrant2tag, ' +
            'winner, ' +
            'entrant1Score, ' +
            'entrant2Score' +
          ') SELECT * FROM UNNEST (' +
            '$1::text[], ' + // set id
            '$2::text[], ' + // identifier
            '$3::int[], ' + // 1id
            '$4::int[], ' + // 2id
            '$5::text[], ' + // 1tag
            '$6::text[], ' + // 2tag
            '$7::int[], ' + // winner id
            '$8::int[], ' + // 1 score
            '$9::int[]' + // 2 score
          '); ';

          const setData: (number | string)[][] = sets.reduce((acc, set) => {

            console.log('==storing temp set data==');
            console.log(set.id, set.identifier, set.entrant1Id, set.entrant2Id);
            return [
              [...acc[0], set.id,],
              [...acc[1], set.identifier],
              [...acc[2], set.entrant1Id],
              [...acc[3], set.entrant2Id],
              [...acc[4], set.entrant1Id ? players[set.entrant1Id] : 'Pending'],
              [...acc[5], set.entrant2Id ? players[set.entrant2Id] : 'Pending'],
              [...acc[6], set.winnerId],
              [...acc[7], set.entrant1Score],
              [...acc[8], set.entrant2Score],
            ];

          }, [[], [], [], [], [], [], [], [], []]);

          return client.query(updateTempTable, setData);

        }, err => {
          console.error('couldnt create temp table');
          console.error(err);
        }).then(d => {

          const updateQuery = 'UPDATE matches ' +
            'SET matches.set_id = updates.set_id, ' +
            'matches.entrant1id = updates.entrant1id, ' +
            'matches.entrant2id = updates.entrant2id, ' +
            'matches.entrant1tag = updates.entrant1tag, ' +
            'matches.entrant2tag = updates.entrant2tag, ' +
            'matches.winner = updates.winner, ' +
            'matches.entrant1Score = updates.entrant1Score ' +
            'FROM updates WHERE matches.identifier = updates.identifier AND matches.event_id=' + id;

          return client.query(updateQuery);

        }, err => {
          console.error('couldnt update temp table');
          console.error(err);
        }).then(() => {
          client.release();
          return Promise.resolve();
        }, err => {
          console.error('couldnt update main table :(');
          console.error(err);
        })

    });

  }

}