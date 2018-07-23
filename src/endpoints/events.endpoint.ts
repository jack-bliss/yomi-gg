import { Path, GET, ContextRequest, Errors, PathParam, QueryParam, PATCH, Preprocessor, FormParam } from 'typescript-rest';
import { RequestExtended } from '../interfaces/request-extended.interface';
import { Event } from '../models/event.model';
import { Match } from '../models/match.model';
import * as escape from 'pg-escape';
import { AdminPreprocessor } from '../preprocessors/admin.preprocessor';
import { StateValidator } from '../validators/state.validator';
import { ErrorCodes, setErrorCode } from '../errors/error-codes';

@Path('/events')
export class EventsEndpoint {

  @GET
  getEvents(
    @ContextRequest { pool, res }: RequestExtended,
  ): Promise<Event[]> {

    return new Promise((resolve, reject) => {

      const eventsQuery = 'SELECT * FROM events';
      pool.query(eventsQuery, (err, response) => {

        if (err) {
          console.error(err);
          setErrorCode(ErrorCodes.UNKNOWN, res);
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
    @ContextRequest { pool, res }: RequestExtended,
  ): Promise<Event> {

    if (typeof id !== 'number') {
      throw new Errors.BadRequestError('id must be a number');
    }

    return new Promise((resolve, reject) => {

      const eventQuery = 'SELECT * FROM events WHERE id=' + id;
      pool.query(eventQuery, (err, response) => {

        if (err) {
          console.error(err);
          setErrorCode(ErrorCodes.UNKNOWN, res);
          reject(new Errors.InternalServerError('Something went wrong fetching the event'));
        } else if (response.rows.length === 0){
          reject(new Errors.NotFoundError('Couldn\'t find an event with that id'));
        } else {
          resolve(new Event(response.rows[0]));
        }

      });

    });

  }

  @Path('/:id')
  @PATCH
  @Preprocessor(AdminPreprocessor)
  updateEvent(
    @ContextRequest { pool, res }: RequestExtended,
    @PathParam('id') id: number,
    @FormParam('state') state: string,
  ): Promise<Event> {

    if (typeof id !== 'number') {
      setErrorCode(ErrorCodes.INVALID_EVENT_ID, res);
      throw new Errors.BadRequestError('id must be a number');
    }
    if (!StateValidator(state)) {
      setErrorCode(ErrorCodes.INVALID_STATE, res);
      throw new Errors.BadRequestError('state is invalid');
    }

    const updateQuery = 'UPDATE events SET state=%L WHERE id=' + id + ' RETURNING *';
    return pool.query(escape(updateQuery, state)).then(r => {
      return new Event(r.rows[0]);
    })

  }

  @Path('/:id/matches')
  @GET
  getMatchesByEvent(
    @PathParam('id') id: number,
    @QueryParam('order') order: (keyof Match) = 'round_order',
    @QueryParam('direction') direction: 'ASC' | 'DESC' = 'ASC',
    @QueryParam('highlight') highlight: number = null,
    @QueryParam('exact') exact: boolean = false,
    @QueryParam('state') state: 'pending' | 'complete' = null,
    @ContextRequest { pool, res }: RequestExtended,
  ): Promise<Match[]> {
    return new Promise((resolve, reject) => {

      if (typeof id !== 'number') {
        setErrorCode(ErrorCodes.INVALID_EVENT_ID, res);
        throw new Errors.BadRequestError('id must be a number');
      }

      if (typeof highlight !== 'number' && highlight !== null) {
        setErrorCode(ErrorCodes.INVALID_HIGHLIGHT, res);
        throw new Errors.BadRequestError('highlight must be a number');
      }

      if (typeof exact !== 'boolean') {
        setErrorCode(ErrorCodes.INVALID_EXACT, res);
        throw new Errors.BadRequestError('exact must be a boolean');
      }

      if (direction !== 'ASC' && direction !== 'DESC') {
        setErrorCode(ErrorCodes.INVALID_DIRECTION, res);
        throw new Errors.BadRequestError('direction is invalid');
      }

      if (!StateValidator(state) && state !== null) {
        setErrorCode(ErrorCodes.INVALID_STATE, res);
        throw new Errors.BadRequestError('invalid state param');
      }

      let matchQuery = 'SELECT * FROM matches WHERE event_id=' + id + ' ';
      if (highlight !== null) {
        matchQuery += 'AND highlight ' + (exact ? '' : '>') + '= ' + highlight + ' ';
      }
      if (state !== null) {
        matchQuery += 'AND state = \'' + state + '\' ';
      }
      matchQuery += 'ORDER BY %I ' + direction;
      pool.query(escape(matchQuery, order), (err, response) => {

        if (err) {
          console.error(err);
          setErrorCode(ErrorCodes.NO_MATCHES_FOUND, res);
          reject(new Errors.InternalServerError('Something went wrong fetching the matches'));
        } else if (response.rows.length === 0){
          setErrorCode(ErrorCodes.UNKNOWN, res);
          reject(new Errors.NotFoundError('Couldn\'t find any matches with that event id'));
        } else {
          resolve(response.rows.map(e => new Match(e)));
        }

      });

    });
  }

}