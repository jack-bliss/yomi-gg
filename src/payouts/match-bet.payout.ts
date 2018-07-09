import { Pool, PoolClient, QueryResult } from 'pg';
import { Match } from '../models/match.model';
import { MatchBet } from '../models/match-bet.model';
import { nNestedArrays } from '../utility/nNestedArrays';

export const MatchBetPayout: (id: number, pool: Pool) => Promise<any> = (id: number, pool: Pool) => {

  let client: PoolClient;
  let match: Match;
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

  }).then((m) => {

    match = m.rows[0];

    const betQuery = 'SELECT * FROM match_bets WHERE match_id=' + id;
    return client.query(betQuery);

  }, err => {

    console.error('Couldn\'t create temp table');
    console.error(err);

  }).then((response: QueryResult) => {

    let totalPayout = 0;
    let totalBacking = 0;

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

    const updateMatch = 'UPDATE match SET ' +
      'total_payout=' + totalPayout + ', ' +
      'total_backing=' + totalBacking + ' ' +
      'WHERE id=' + id;

    return client.query(updateTempTable + updateMatch, values);

  }).then(response => {

    const updateQuery = 'UPDATE profiles SET ' +
      'coins = ' +
      '(profiles.coins + profile_updates.coins + (match.total_payout * (profile_updates.coins / match.total_backing))) ' +
      'FROM profile_updates, matches WHERE profiles.id = profile_updates.coins AND match.id=' + id;

    return client.query(updateQuery);

  }).then(r => {

    client.release();
    return Promise.resolve(true);

  });

};