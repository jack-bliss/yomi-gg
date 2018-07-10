import { Path, GET, ContextRequest, Errors, PathParam, QueryParam } from 'typescript-rest';
import { RequestExtended } from '../interfaces/request-extended.interface';
import { Event } from '../models/event.model';
import { Match } from '../models/match.model';

@Path('/events')
export class EventsEndpoint {

  @GET
  getEvents(
    @ContextRequest { pool }: RequestExtended,
  ): Promise<Event[]> {

    return new Promise((resolve, reject) => {

      const eventsQuery = 'SELECT * FROM events';
      pool.query(eventsQuery, (err, response) => {

        if (err) {
          console.error(err);
          reject(new Errors.InternalServerError('Something went wrong fetching the events'));
        } else {
          resolve(response.rows.map(e => new Event(e)));
        }

      });

    });

  }

  @Path('/:id')
  @GET
  getEventById(
    @PathParam('id') id: number,
    @ContextRequest { pool }: RequestExtended,
  ): Promise<Event> {

    return new Promise((resolve, reject) => {

      const eventQuery = 'SELECT * FROM events WHERE id=' + id;
      pool.query(eventQuery, (err, response) => {

        if (err) {
          console.error(err);
          reject(new Errors.InternalServerError('Something went wrong fetching the event'));
        } else if (response.rows.length === 0){
          reject(new Errors.NotFoundError('Couldn\'t find an event with that id'));
        } else {
          resolve(new Event(response.rows[0]));
        }

      });

    });

  }

  @Path('/:id/matches')
  @GET
  getMatchesByEvent(
    @PathParam('id') id: number,
    @QueryParam('order') order: (keyof Match) = 'round_order',
    @QueryParam('direction') direction: 'ASC' | 'DESC' = 'ASC',
    @QueryParam('highlight') highlight: number = null,
    @QueryParam('exact') exact: boolean = false,
    @ContextRequest { pool }: RequestExtended,
  ): Promise<Match[]> {
    return new Promise((resolve, reject) => {


      let matchQuery = 'SELECT * FROM matches WHERE event_id=' + id + ' ';
      if (highlight !== null) {
        matchQuery += 'AND highlight ' + (exact ? '' : '>') + '=' + highlight + ' ';
      }
      matchQuery += 'ORDER BY ' + order + ' ' + direction;
      pool.query(matchQuery, (err, response) => {

        if (err) {
          console.error(err);
          reject(new Errors.InternalServerError('Something went wrong fetching the matches'));
        } else if (response.rows.length === 0){
          reject(new Errors.NotFoundError('Couldn\'t find any matches with that event id'));
        } else {
          console.log(response.rows[0]);
          resolve(response.rows.map(e => new Match(e)));
        }

      });

    });
  }

}