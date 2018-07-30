import { Path, POST, GET, ContextRequest, FormParam, Errors, QueryParam, PathParam, Preprocessor } from 'typescript-rest';
import { RequestExtended } from '../interfaces/request-extended.interface';
import { MatchBet } from '../models/match-bet.model';
import { MatchBetBreakdown } from '../interfaces/match-bet-breakdown.interface';
import { MemberPreprocessor } from '../preprocessors/member.preprocessor';
import { AdminPreprocessor } from '../preprocessors/admin.preprocessor';
import * as escape from 'pg-escape';
import { MatchBetExpanded } from '../models/match-bet-expanded.model';
import { Match } from '../models/match.model';
import { ErrorCodes, setErrorCode } from '../errors/error-codes';

@Path('/bet')
export class BetEndpoint {

  @Path('/match')
  @POST
  @Preprocessor(MemberPreprocessor)
  placeMatchBet(
    @ContextRequest { pool, session, res }: RequestExtended,
    @FormParam('match_id') match_id: number,
    @FormParam('prediction') prediction: number,
    @FormParam('wager') wager: number,
  ): Promise<MatchBet> {

    if (typeof match_id !== 'number') {
      setErrorCode(ErrorCodes.INVALID_MATCH_ID, res);
      throw new Errors.BadRequestError('match_id must be a number');
    }

    if (typeof prediction !== 'number') {
      setErrorCode(ErrorCodes.INVALID_PREDICTION, res);
      throw new Errors.BadRequestError('prediction must be a number');
    }

    if (typeof wager !== 'number' || wager > 5) {
      setErrorCode(ErrorCodes.INVALID_WAGER, res);
      throw new Errors.BadRequestError('wager must be a number not greater than 5');
    }

    let newCoins: number;

    const checkMatchQuery = 'SELECT * FROM matches WHERE id=' + match_id;
    return pool.query(checkMatchQuery).then((response) => {

      const match: Match = new Match(response.rows[0]);

      if (match.state !== 'pending') {
        setErrorCode(ErrorCodes.MATCH_STARTED, res);
        throw new Errors.BadRequestError('You can\'t bet on that match');
      }

      const getMatchBetsQuery = 'SELECT * FROM match_bets WHERE profile_id=' + session.profile.id + ' ' +
        'AND match_id=' + match_id;
      return pool.query(getMatchBetsQuery);

    }).then((response) => {

      if (response.rows.length > 0) {
        setErrorCode(ErrorCodes.ALREADY_BET, res);
        throw new Errors.BadRequestError('You\'ve already bet on that.');
      }

      const getCoinsQuery = 'SELECT coins FROM profiles WHERE id=' + session.profile.id;
      return pool.query(getCoinsQuery)

    }).then((response: { rows: { coins: number }[] }) => {

      const myCoins = response.rows[0].coins;
      if (myCoins < wager) {
        setErrorCode(ErrorCodes.NOT_ENOUGH_COINS, res);
        throw new Errors.BadRequestError('You don\'t have enough coins for that.');
      }
      newCoins = myCoins - wager;
      const createBetQuery =
        'UPDATE profiles SET coins=' + newCoins + ' WHERE id=' + session.profile.id + '; ' +
        'INSERT INTO match_bets (profile_id, match_id, prediction, wager) VALUES(' +
        session.profile.id + ', ' +
        match_id + ', ' +
        prediction + ', ' +
        wager +
        ') RETURNING *';
      return pool.query(createBetQuery);
    }, err => {
      console.error(err);
      setErrorCode(ErrorCodes.UNKNOWN, res);
      throw new Error('Something went wrong checking how many coins you have.');
    }).then((updated: any) => {
      session.profile.coins = newCoins;
      return new MatchBet(updated[1].rows[0]);
    }, err => {
      console.error(err);
      setErrorCode(ErrorCodes.UNKNOWN, res);
      throw new Error('Something went wrong creating the bet.');
    });

  }

  @Path('/match')
  @GET
  @Preprocessor(MemberPreprocessor)
  getMyMatchBets(
    @ContextRequest { pool, session, res }: RequestExtended,
    @QueryParam('order') order: (keyof MatchBet) = 'date',
    @QueryParam('direction') direction: 'ASC' | 'DESC' = 'ASC',
  ): Promise<MatchBetExpanded[]> {

    if (direction !== 'ASC' && direction !== 'DESC') {
      setErrorCode(ErrorCodes.INVALID_DIRECTION, res);
      throw new Errors.BadRequestError('Invalid direction');
    }

    else if (MatchBet.fields.indexOf(order) === -1) {
      setErrorCode(ErrorCodes.INVALID_MATCH_FIELD, res);
      throw new Errors.BadRequestError('Invalid match field');
    }

    return new Promise((resolve, reject) => {

      const getMyBetsQuery = 'SELECT ' +
        'prediction, wager, outcome, winnings, ' +
        'entrant1id, entrant2id, entrant1tag, entrant2tag, round, round_order, ' +
        'name AS tournament ' +
        'FROM match_bets, matches, events ' +
        'WHERE match_bets.match_id = matches.id AND ' +
        'events.id = matches.event_id AND ' +
        'profile_id = ' + session.profile.id + ' ' +
        'ORDER BY %I ' + direction;

      pool.query(escape(getMyBetsQuery, order), (err, response) => {
        if (err) {
          console.error(err);
          setErrorCode(ErrorCodes.UNKNOWN, res);
          reject(new Errors.InternalServerError('Something went wrong fetching the bets.'));
        } else {
          resolve(response.rows.map(b => new MatchBetExpanded(b)));
        }
      });

    });

  }

  @Path('/match/:match_id')
  @GET
  @Preprocessor(AdminPreprocessor)
  getBetsOnMatch(
    @ContextRequest { pool, res }: RequestExtended,
    @PathParam('match_id') match_id: number,
    @QueryParam('order') order: (keyof MatchBet) = 'date',
    @QueryParam('direction') direction: 'ASC' | 'DESC' = 'ASC',
  ): Promise<MatchBetExpanded[]> {

    if (typeof match_id !== 'number') {
      setErrorCode(ErrorCodes.INVALID_MATCH_ID, res);
      throw new Errors.BadRequestError('Invalid match id, ' + match_id);
    }

    if (direction !== 'ASC' && direction !== 'DESC') {
      setErrorCode(ErrorCodes.INVALID_DIRECTION, res);
      throw new Errors.BadRequestError('Invalid direction');
    }

    else if (MatchBet.fields.indexOf(order) === -1) {
      setErrorCode(ErrorCodes.INVALID_MATCH_FIELD, res);
      throw new Errors.BadRequestError('Invalid match field');
    }

    const query = 'SELECT ' +
      'prediction, wager, outcome, winnings, ' +
      'entrant1id, entrant2id, entrant1tag, entrant2tag, round, round_order, ' +
      'name AS tournament, ' +
      'username AS bettor ' +
      'FROM match_bets, matches, events, profiles ' +
      'WHERE match_bets.match_id = matches.id AND ' +
      'match_bets.profile_id = profiles.id AND ' +
      'events.id = matches.event_id AND ' +
      'match_id = ' + match_id + ' ' +
      'ORDER BY %I ' + direction;

    return pool.query(escape(query, order)).then(response => {
      return response.rows.map(row => new MatchBetExpanded(row));
    })
  }

  @Path('/match/:match_id/breakdown/')
  @GET
  @Preprocessor(AdminPreprocessor)
  getBetBreakdown(
    @ContextRequest { pool, res }: RequestExtended,
    @PathParam('match_id') match_id: number,
  ): Promise<MatchBetBreakdown> {

    return new Promise((resolve, reject) => {

      let getTotalWagerOnSetQuery = 'SELECT * FROM match_bets WHERE match_id=' + match_id;
      pool.query(getTotalWagerOnSetQuery, (err, response) => {
        if (err) {
          console.error(err);
          setErrorCode(ErrorCodes.UNKNOWN, res);
          reject(new Errors.InternalServerError('Something went wrong fetching the bet wagers'));
        } else {

          const breakdown: MatchBetBreakdown = {
            total: 0,
          };

          response.rows.map(row => new MatchBet(row)).forEach((bet: MatchBet) => {

            breakdown.total += bet.wager;

            if (!breakdown.hasOwnProperty(bet.prediction)) {
              breakdown[bet.prediction] = 0;
            }
            breakdown[bet.prediction] += bet.wager;

          });

          resolve(breakdown);

        }
      });

    });

  }

}