import { Pool } from 'pg';
import { SmashggTournament } from '../interfaces/smashgg/smashgg-tournament.interface';
import { GetTournament } from './get-tournament';
import { GetGroupSets } from './get-group-sets';
import { SmashggSet } from '../interfaces/smashgg/smashgg-set.interface';
import { Event } from '../models/event.model';
import { nNestedArrays } from '../utility/nNestedArrays';

export const ImportTournament:
  (tournament: string, group_id: number, pool: Pool) => Promise<Event> =
  (tournament: string, group_id: number, pool: Pool) => {

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

    }, nNestedArrays<number | string>(9));

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
};