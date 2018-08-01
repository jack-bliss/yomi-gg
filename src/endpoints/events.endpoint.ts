import { Path, GET, ContextRequest, Errors, PathParam, QueryParam, PATCH, Preprocessor, FormParam } from 'typescript-rest';
import { RequestExtended } from '../interfaces/request-extended.interface';
import { Event } from '../models/event.model';
import { Match } from '../models/match.model';
import * as escape from 'pg-escape';
import { AdminPreprocessor } from '../preprocessors/admin.preprocessor';
import { StateValidator } from '../validators/state.validator';
import { ErrorCodes, setErrorCode } from '../errors/error-codes';
import { State } from '../types/state.type';
import { MatchBetSpread } from '../models/match-bet-spread.model';
import { MatchBet } from '../models/match-bet.model';

@Path('/events')
export class EventsEndpoint {

  @GET
  getEvents(
    @QueryParam('state') state: State = null,
    @ContextRequest { pool, res }: RequestExtended,
  ): Promise<Event[]> {

    if (!StateValidator(state) && state !== null) {
      setErrorCode(ErrorCodes.INVALID_STATE, res);
      throw new Errors.BadRequestError('invalid state param');
    }

    return new Promise((resolve, reject) => {

      let eventsQuery = 'SELECT * FROM events';
      if (state !== null) {
        eventsQuery += ' WHERE state=\'' + state + '\'';
      }
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
    @QueryParam('state') state: State = null,
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
          setErrorCode(ErrorCodes.UNKNOWN, res);
          console.error(err);
          reject(new Errors.InternalServerError('Something went wrong fetching the matches'));
        } else {
          resolve(response.rows.map(e => new Match(e)));
        }

      });

    });
  }

  @Path('/:id/matches/breakdown')
  @GET
  @Preprocessor(AdminPreprocessor)
  getEventBreakdown(
    @PathParam('id') id: number,
    @ContextRequest { pool, res }: RequestExtended,
  ): Promise<MatchBetSpread[]> {
    if (typeof id !== 'number') {
      setErrorCode(ErrorCodes.INVALID_EVENT_ID, res);
      throw new Errors.BadRequestError('invalid event id');
    }
    let matches: Match[];
    return pool.query('SELECT * FROM matches WHERE id=' + id + ' AND highlight > 0')
      .then(r => {
        matches = r.rows.map(m => new Match(m));
        const ids = matches.map(m => m.id);
        const list = '(' + ids.join(',') + ')';
        return pool.query('SELECT * FROM match_bets WHERE match_id in ' + list); 
      }).then(r => {
        const bets = r.rows.map(b => new MatchBet(b));
        const matchBetSpreads: MatchBetSpread[] = matches.map((match: Match) => {
          return {
            round: match.round,
            state: match.state,
            entrants: [
              {
                score: match.entrant1score,
                tag: match.entrant1tag,
                id: match.entrant1id,
                backing: bets
                  .filter(b => b.prediction === match.entrant1id)
                  .reduce((acc, b) => acc + b.wager, 0),
                is_winner: match.entrant1id === match.winner,
              },
              {
                score: match.entrant2score,
                tag: match.entrant2tag,
                id: match.entrant2id,
                backing: bets
                  .filter(b => b.prediction === match.entrant2id)
                  .reduce((acc, b) => acc + b.wager, 0),
                is_winner: match.entrant2id === match.winner,
              }
            ]
          }
        });
        return matchBetSpreads;
      });
  }

}