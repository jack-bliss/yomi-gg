import { Pool } from 'pg';
import { SmashggTournament } from '../interfaces/smashgg/smashgg-tournament.interface';
import { GetTournament } from './get-tournament';
import { Event } from '../models/event.model';
import { ImportGroup } from './import-group';
import { queuePromiseFactories } from '../utility/queuePromiseFactories';

export const ImportTournament = (tournament: string, group_id: string, pool: Pool) => {

  let eventName: string, eventId: number, image: string, starting: Date, smashgg_id: number;
  const players: { [key: number]: string } = {};

  return GetTournament(tournament).then(STE => {

    const T: SmashggTournament = STE.tournament;
    eventName = T.name;
    image = T.images[0].url;
    smashgg_id = T.id;
    starting = new Date(T.startAt * 1000);
    STE.entrants.forEach(e => {
      players[e.id] = e.name;
    });

    const eventQuery = 'INSERT INTO events (phase_group, name, slug, image, starting, smashgg_id) VALUES (' +
      '$1::text, ' +
      '$2::text, ' +
      '$3::text, ' +
      '$4::text, ' +
      '$5, ' +
      '$6::int' +
      ') RETURNING id';

    return pool.query(
      eventQuery,
      [group_id, eventName, tournament, image, starting, smashgg_id],
    )


  }).then((eventResult) => {

    eventId = eventResult.rows[0].id;
    const group_ids = group_id.split(',');
    return queuePromiseFactories(group_ids.map(id => {
      return () => ImportGroup(parseInt(id), eventId, pool, players);
    }))

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