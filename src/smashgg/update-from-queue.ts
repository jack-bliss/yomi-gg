import { Pool, PoolClient } from 'pg';
import axios, { AxiosResponse } from 'axios';
import { SmashggStationQueueResponse } from '../interfaces/smashgg/smashgg-station-queue.interface';
import { nNestedArrays } from '../utility/nNestedArrays';
import { nOf } from '../utility/nOf';

export const UpdateFromQueue = (smashgg_id: number, pool: Pool): Promise<any> => {

  let client: PoolClient;

  console.log('updating queue of event', smashgg_id);

  return pool.connect().then(c => {

    client = c;

    const createTempTable = 'CREATE TEMP TABLE match_updates (' +
      'set_id VARCHAR(50),' +
      'stream INT,' +
      'stream_order INT' +
      ');'

    return client.query(createTempTable)

  }).then(d => {

    return axios
      .get('https://api.smash.gg/station_queue/' + smashgg_id)
      
  }).then((response: AxiosResponse<SmashggStationQueueResponse>) => {
    const streams = response.data.queues;
    const insterIntoMatchUpdates = 'INSERT INTO match_updates (' +
      'set_id, ' +
      'stream, ' +
      'stream_order' +
      ') SELECT * FROM UNNEST (' +
      '$1::int[], ' +
      '$2::int[], ' +
      '$3::int[]' +
      ');';
    let updateData = nNestedArrays(3);
    for (const stream_id in streams) {
      const queue = streams[stream_id];
      const queueLength = queue.length;
      updateData = [
        [...updateData[0], ...queue],
        [...updateData[1], ...nOf(queueLength, stream_id)],
        [...updateData[2], ...(nOf(queueLength, 0).map((v, i) => i))]
      ];
    }
    return client.query(insterIntoMatchUpdates, updateData);
  }).then(r => {
    const updateMatches = 'UPDATE matches SET ' +
      'stream = match_updates.stream, ' +
      'stream_order = match_updates.stream_order, ' +
      'highlight = 2 ' +
      'FROM match_updates WHERE ' +
      'matches.set_id = match_updates.set_id;'
    return client.query(updateMatches);
  }).then(updated => {
    return client.query('DROP TABLE match_updates');
  }).then(dropped => {
    client.release();
    return 'all done';
  });

}