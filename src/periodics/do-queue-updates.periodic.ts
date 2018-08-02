import { Pool } from 'pg';
import { Event } from '../models/event.model';
import { queuePromiseFactories } from '../utility/queuePromiseFactories';
import { UpdateFromQueue } from '../smashgg/update-from-queue';

export const DoQueueUpdates = (pool: Pool): Promise<any> => {
  const selectFromEvents = 'SELECT * FROM events WHERE state != \'complete\'';
  return pool.query(selectFromEvents)
    .then((r) => {
      const events = r.rows.map(e => new Event(e));
      return queuePromiseFactories(events.map(event => {
        return () => UpdateFromQueue(event.smashgg_id, pool);
      }));
    })
}