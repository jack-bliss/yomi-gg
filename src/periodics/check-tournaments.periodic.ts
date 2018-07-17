import { Event } from '../models/event.model';
import { Pool } from 'pg';

export const CheckTournaments: (pool: Pool) => Promise<Event[]> = (pool: Pool) => {

  const getEventsQuery = 'SELECT * FROM events WHERE state=\'in progress\'';

  return pool.query(getEventsQuery).then(response => {

    return response.rows.map(e => new Event(e));

  });

};
