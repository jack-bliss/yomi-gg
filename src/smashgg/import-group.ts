import { resolve } from "url";
import { GetGroupSets } from './get-group-sets';
import { Pool } from 'pg';
import { SmashggSet } from '../interfaces/smashgg/smashgg-set.interface';
import { nNestedArrays } from '../utility/nNestedArrays';

export const ImportGroup = (
    group_id: number, 
    event_id: number, 
    pool: Pool,
    players: { [key: number]: string },
  ): Promise<any> => {

  return GetGroupSets(group_id)
    .then(SGSE => {
      const insertSetsQuery = 'INSERT INTO matches (' +
      'set_id, ' +
      'entrant1id, ' +
      'entrant2id, ' +
      'event_id, ' +
      'entrant1tag, ' +
      'entrant2tag, ' +
      'round, ' +
      'round_order, ' +
      'identifier, ' +
      'group_id' +
      ') SELECT * FROM UNNEST (' +
      '$1::text[], ' +
      '$2::int[], ' +
      '$3::int[], ' +
      '$4::int[], ' +
      '$5::text[], ' +
      '$6::text[], ' +
      '$7::text[], ' +
      '$8::int[], ' +
      '$9::text[], ' +
      '$10::int[]' +
      ');';

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
      console.log(set.id, set.entrant1Id, set.entrant2Id, event_id, group_id);
      return [
        [...acc[0], set.id,],
        [...acc[1], set.entrant1Id],
        [...acc[2], set.entrant2Id],
        [...acc[3], event_id],
        [...acc[4], set.entrant1Id ? players[set.entrant1Id] : 'Pending'],
        [...acc[5], set.entrant2Id ? players[set.entrant2Id] : 'Pending'],
        [...acc[6], set.fullRoundText],
        [...acc[7], set.round],
        [...acc[8], set.identifier],
        [...acc[9], group_id]
      ];

    }, nNestedArrays<number | string>(10));

    return pool.query(insertSetsQuery, setData);
  });

}