import { Pool } from 'pg';
import { Match } from '../models/match.model';

export const CheckMatches = (pool: Pool): Promise<Match[]> => {

  const findMatchesQuery = 'SELECT * FROM matches WHERE winner IS NOT NULL AND state != \'complete\'';
  
  return pool.query(findMatchesQuery).then(response => {
    console.log('check matches found', response.rows.length);
    return response.rows.map(match => new Match(match));

  });

};