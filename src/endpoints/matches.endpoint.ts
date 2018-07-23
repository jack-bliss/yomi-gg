import { Path, GET, POST, Errors, ContextRequest, PathParam, QueryParam, Preprocessor, FormParam, PATCH } from 'typescript-rest';
import { RequestExtended } from '../interfaces/request-extended.interface';
import { Match } from '../models/match.model';
import { AdminPreprocessor } from '../preprocessors/admin.preprocessor';
import { State } from '../types/state.type';
import { StateValidator } from '../validators/state.validator';
import { ErrorCodes, setErrorCode } from '../errors/error-codes';

@Path('/matches')
export class MatchesEndpoint {

  @Path('/highlighted')
  @GET
  getHighlightedMatches(
    @QueryParam('highlight') highlight: number = null,
    @QueryParam('exact') exact: boolean = false,
    @ContextRequest { pool, res }: RequestExtended,
  ): Promise<Match[]> {

    if (typeof highlight !== 'number' && highlight !== null) {
      setErrorCode(ErrorCodes.INVALID_HIGHLIGHT, res);
      throw new Errors.BadRequestError('highlight must be a number');
    }

    if (typeof exact !== 'boolean') {
      setErrorCode(ErrorCodes.INVALID_EXACT, res);
      throw new Errors.BadRequestError('exact must be a boolean');
    }

    return new Promise((resolve, reject) => {

      let matchQuery = 'SELECT * FROM matches WHERE highlight';
      if (highlight === null) {
        matchQuery += '!=0';
      } else {
        matchQuery += (exact ? '' : '>') + '=' + highlight;
      }

      pool.query(matchQuery, (err, response) => {

        if (err) {
          console.error(err);
          setErrorCode(ErrorCodes.UNKNOWN, res);
          reject(new Errors.InternalServerError('Something went wrong fetching the matches'));
        } else {
          resolve(response.rows.map(m => new Match(m)));
        }

      })

    });

  }

  @Path('/:id')
  @GET
  getMatchById(
    @PathParam('id') id: number,
    @ContextRequest { pool, res }: RequestExtended,
  ): Promise<Match> {

    if (typeof id !== 'number') {
      setErrorCode(ErrorCodes.INVALID_MATCH_ID, res);
      throw new Errors.BadRequestError('id must be a number');
    }

    return new Promise((resolve, reject) => {

      const matchQuery = 'SELECT * FROM matches WHERE id=' + id;
      pool.query(matchQuery, (err, response) => {

        if (err) {
          console.error(err);
          setErrorCode(ErrorCodes.UNKNOWN, res);
          reject(new Errors.InternalServerError('Something went wrong fetching the match'));
        } else if (response.rows.length === 0) {
          setErrorCode(ErrorCodes.NO_MATCHES_FOUND, res);
          reject(new Errors.NotFoundError('Couldn\'t find a match with that id'));
        } else {
          resolve(new Match(response.rows[0]));
        }

      });

    });

  }

  @Path('/:id')
  @PATCH
  @Preprocessor(AdminPreprocessor)
  updateMatchWithId(
    @PathParam('id') id: number,
    @FormParam('state') state: State = null,
    @ContextRequest { pool, res }: RequestExtended,
  ): Promise<Match> {

    if (!StateValidator(state) && state !== null) {
      setErrorCode(ErrorCodes.INVALID_STATE, res);
      throw new Errors.BadRequestError('Invalid state value.');
    }

    let update = 'UPDATE matches SET ';
    if (state !== null) {
      update += 'state=\'' + state + '\' ';
    }
    update += 'WHERE id=' + id + ' RETURNING *;';
    return pool.query(update).then(response => {
      if (!response.rows.length) {
        setErrorCode(ErrorCodes.NO_MATCHES_FOUND, res);
        throw new Errors.NotFoundError('Couldn\'t find a match with that ID');
      }
      return new Match(response.rows[0]);
    });

  }

  @Path('/highlight/')
  @POST
  @Preprocessor(AdminPreprocessor)
  highlightMatchWithId(
    @FormParam('highlight') highlight: number = 1,
    @FormParam('id') id: number,
    @ContextRequest { pool, res }: RequestExtended,
  ): Promise<Match> {

    if (typeof highlight !== 'number') {
      setErrorCode(ErrorCodes.INVALID_HIGHLIGHT, res);
      throw new Errors.BadRequestError('highlight must be a number');
    }

    if (typeof id !== 'number') {
      setErrorCode(ErrorCodes.INVALID_MATCH_ID, res);
      throw new Errors.BadRequestError('id must be a number');
    }

    return new Promise((resolve, reject) => {

      const updateMatchQuery = 'UPDATE matches SET highlight=' + highlight + ' WHERE id=' + id + ' RETURNING *';
      pool.query(updateMatchQuery, (err, response) => {

        if (err) {
          console.error(err);
          setErrorCode(ErrorCodes.UNKNOWN, res);
          reject(new Errors.InternalServerError('Couldn\'t update highlighting of that match!'));
        } else if (response.rows.length === 0) {
          setErrorCode(ErrorCodes.NO_MATCHES_FOUND, res);
          reject(new Errors.NotFoundError('Couldn\'t find a match with that id'));
        } else {
          resolve(new Match(response.rows[0]));
        }

      });

    });

  }

}