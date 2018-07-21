import { Pool, PoolClient } from 'pg';
import { SmashggSet } from '../interfaces/smashgg/smashgg-set.interface';
import { GetGroupSets, SmashggGroupSetsEntities } from './get-group-sets';
import { GetTournament, SmashggTournamentEntities } from './get-tournament';
import { nNestedArrays } from '../utility/nNestedArrays';

export const UpdateTournament: (id: number, pool: Pool) => Promise<void> = (id: number, pool: Pool) => {
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

    const tempTable = 'CREATE TEMP TABLE match_updates (' +
      'set_id VARCHAR(20), ' +
      'identifier VARCHAR(2), ' +
      'entrant1id NUMERIC(10, 0), ' +
      'entrant2id NUMERIC(10, 0), ' +
      'entrant1tag VARCHAR(100), ' +
      'entrant2tag VARCHAR(100), ' +
      'winner NUMERIC(10, 0), ' +
      'entrant1Score NUMERIC(2, 0), ' +
      'entrant2Score NUMERIC(2, 0), ' +
      'state VARCHAR(20)' +
      '); ';


    return client.query(tempTable)
    .then(r => {

      const updateTempTable = 'INSERT INTO match_updates (' +
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

      const setData: (number | string)[][] = sets.reduce((acc: (number | string)[][], set) => {

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

      }, nNestedArrays<number | string>(9));

      return client.query(updateTempTable, setData);

    }, err => {
      console.error('couldn\'t create temp table');
      console.error(err);
    }).then(d => {

      const updateQuery = 'UPDATE matches SET ' +
        'set_id = match_updates.set_id, ' +
        'entrant1id = match_updates.entrant1id, ' +
        'entrant2id = match_updates.entrant2id, ' +
        'entrant1tag = match_updates.entrant1tag, ' +
        'entrant2tag = match_updates.entrant2tag, ' +
        'winner = match_updates.winner, ' +
        'entrant1Score = match_updates.entrant1Score, ' +
        'entrant2Score = match_updates.entrant2Score ' +
        'FROM match_updates WHERE matches.identifier = match_updates.identifier AND matches.event_id=' + id;

      return client.query(updateQuery);

    }, err => {
      console.error('couldnt update temp table');
      console.error(err);
    }).then(() => {
      return client.query('DROP TABLE IF EXISTS match_updates');
    }, err => {
      console.error('couldnt update main table :(');
      console.error(err);
    }).then(() => {
      console.log('releasing client');
      client.release();
      return;
    }, err => {
      client.release();
    })

  });
};