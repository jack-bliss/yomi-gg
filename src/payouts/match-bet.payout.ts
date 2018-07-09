import { Pool, PoolClient, QueryResult } from 'pg';
import { Match } from '../models/match.model';
import { MatchBet } from '../models/match-bet.model';
import { nNestedArrays } from '../utility/nNestedArrays';

export const MatchBetPayout: (id: number, pool: Pool) => Promise<any> = (id: number, pool: Pool) => {

  let client: PoolClient;
  let match: Match;

  let totalPayout = 0;
  let totalBacking = 0;

  return pool.connect().then((c: PoolClient) => {
    client = c;
    const tempTableQuery = 'CREATE TEMP TABLE profile_updates (' +
      'id NUMERIC(10),' +
      'coins NUMERIC' +
      ');';
    return client.query(tempTableQuery);
  }, err => {
    console.error('Couldn\'t connect to the pool');
    console.error(err);
  }).then(() => {

    const matchQuery = 'UPDATE matches SET state=\'complete\' WHERE id=' + id + ' RETURNING *';
    return client.query(matchQuery);

  }, err => {

    console.error('Couldn\'t create temp table');
    console.error(err);

  }).then((m: QueryResult) => {

    match = m.rows[0];

    const betQuery = 'SELECT * FROM match_bets WHERE match_id=' + id;
    return client.query(betQuery);

  }, err => {

    console.error('Couldn\'t update match');
    console.error(err);

  }).then((response: QueryResult) => {

    const updateTempTable = 'INSERT INTO profile_updates (' +
      'id, ' +
      'coins' +
    ') SELECT * FROM UNNEST (' +
      '$1::int[], ' + // profile id
      '$2::int[]' + // coins
    '); ';

    const values: number[][] = response.rows.reduce((acc, row: MatchBet) => {

      if (row.prediction === match.winner) {
        totalBacking += row.wager;
        return [
          [...acc[0], row.profile_id],
          [...acc[1], row.wager]
        ]
      } else {
        totalPayout += row.wager;
        return acc;
      }

    }, nNestedArrays<number>(2));

    return client.query(updateTempTable, values);

  }, err => {

    console.error('Couldn\'t select match_bets');
    console.error(err);

  }).then(() => {

    const updateMatch = 'UPDATE matches SET ' +
      'total_payout=' + totalPayout + ', ' +
      'total_backing=' + totalBacking + ' ' +
      'WHERE id=' + id;


    return client.query(updateMatch);

  }, err => {

    console.error('Couldn\'t insert into temp table');
    console.error(err);

  }).then(() => {

    const updateQuery = 'UPDATE profiles SET ' +
      'coins = ' +
      '(profiles.coins + profile_updates.coins + (match.total_payout * (profile_updates.coins / match.total_backing))) ' +
      'FROM profile_updates, matches WHERE profiles.id = profile_updates.id AND match.id=' + id;

    return client.query(updateQuery);

  }, err => {

    console.error('Couldn\'t update matches');
    console.error(err);

  }).then(r => {

    client.release();
    return Promise.resolve(true);

  }, err => {

    console.error('Couldn\'t update profiles :(');
    console.error(err);

  });

};