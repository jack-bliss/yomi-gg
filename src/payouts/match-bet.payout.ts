import { Pool, PoolClient, QueryResult } from 'pg';
import { Match } from '../models/match.model';
import { MatchBet } from '../models/match-bet.model';
import { nNestedArrays } from '../utility/nNestedArrays';
import { nOf } from '../utility/nOf';

export const MatchBetPayout: (id: number, pool: Pool) => Promise<any> = (id: number, pool: Pool) => {

  let client: PoolClient;
  let match: Match;

  let totalPayout = 0;
  let totalBacking = 0;

  let matchBetUpdates = nNestedArrays<number | string>(2);

  return pool.connect().then((c: PoolClient) => {
    client = c;
    const tempTableQuery = 'CREATE TEMP TABLE profile_updates (' +
      'id bigint, ' +
      'coins real, ' +
      'total_backing real, ' +
      'total_payout real' +
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
      'coins, ' +
      'total_backing, ' +
      'total_payout' +
      ') SELECT * FROM UNNEST (' +
      '$1::int[], ' + // profile id
      '$2::int[], ' + // coins
      '$3::int[], ' + // total_backing
      '$4::int[]' + // total_payout
      '); ';

    const profileUpdates: number[][] = response.rows
      .map(row => new MatchBet(row))
      .reduce((acc, row: MatchBet) => {

        matchBetUpdates[0].push(row.id);

        if (row.prediction === match.winner) {
          matchBetUpdates[1].push('win');
          totalBacking += row.wager;
          console.log('== profile won with wager ==');
          console.log(row.profile_id, row.wager);
          return [
            [...acc[0], row.profile_id],
            [...acc[1], row.wager],
          ];
        } else {
          matchBetUpdates[1].push('loss');
          totalPayout += row.wager;
          return [
            [...acc[0], row.profile_id],
            [...acc[1], 0],
          ];
        }

      }, nNestedArrays<number>(2));

    if (totalBacking === 0) {

      throw new Error('Match is un-backed!');
    }

    profileUpdates.push(nOf(profileUpdates[0].length, totalBacking));
    profileUpdates.push(nOf(profileUpdates[0].length, totalPayout));

    matchBetUpdates.push(nOf(profileUpdates[0].length, totalBacking));
    matchBetUpdates.push(nOf(profileUpdates[0].length, totalPayout));

    matchBetUpdates[1].forEach((outcome, ind) => {
      if (outcome === 'loss') {
        matchBetUpdates[3][ind] = 0;
        profileUpdates[3][ind] = 0;
      }
    });


    console.log('== profile updates ==');
    console.log(profileUpdates[0]);
    console.log(profileUpdates[1]);
    console.log(profileUpdates[2]);
    console.log(profileUpdates[3]);

    return client.query(updateTempTable, profileUpdates);

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

    const coinFunction =
      '(profiles.coins + profile_updates.coins + ' +
      '(profile_updates.total_payout * (profile_updates.coins / profile_updates.total_backing))) ';

    const updateQuery = 'UPDATE profiles SET ' +
      'coins = ' +
      coinFunction +
      'FROM profile_updates WHERE profiles.id = profile_updates.id';

    return client.query(updateQuery);

  }, err => {


    console.error('Couldn\'t update matches');
    console.error(err);

  }).then(r => {

    const tempTableQuery2 = 'CREATE TEMP TABLE bet_updates (' +
      'id BIGINT, ' +
      'outcome VARCHAR(15), ' +
      'total_backing REAL, ' +
      'total_payout REAL' +
      ');';

    return client.query(tempTableQuery2);

  }, err => {


    console.error('Couldn\'t update profiles :(');
    console.error(err);

  }).then(() => {

    console.log('== match bet updates ==');
    console.log(matchBetUpdates[0]);
    console.log(matchBetUpdates[1]);
    console.log(matchBetUpdates[2]);
    console.log(matchBetUpdates[3]);

    const updateTempTableBets = 'INSERT INTO bet_updates (' +
      'id, ' +
      'outcome, ' +
      'total_backing, ' +
      'total_payout' +
      ') SELECT * FROM UNNEST (' +
      '$1::int[], ' +
      '$2::text[], ' +
      '$3::float[], ' +
      '$4::float[]' +
      ')';

    return client.query(updateTempTableBets, matchBetUpdates);

  }).then(() => {

    const updateMatchBetsQuery = 'UPDATE match_bets SET ' +
      'outcome = bet_updates.outcome, ' +
      'winnings = bet_updates.total_payout * (match_bets.wager / bet_updates.total_backing) ' +
      'FROM bet_updates WHERE match_bets.id = bet_updates.id';

    return client.query(updateMatchBetsQuery);

  }, err => {

    console.error('couldnt create temp table');
    console.error(err);
  }).then(() => {

    return client.query('DROP TABLE profile_updates, bet_updates');

  }, err => {

    console.error(matchBetUpdates[0], matchBetUpdates[2], matchBetUpdates[3], matchBetUpdates[3]);
    console.error('couldnt update match bets');
    console.error(err);

  }).then(() => {

    client.release();
    return Promise.resolve(true);

  }, err => {

    client.release();
    console.error('couldnt clear temp tables');
  });

};