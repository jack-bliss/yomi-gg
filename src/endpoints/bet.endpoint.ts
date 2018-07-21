import { Path, POST, GET, ContextRequest, FormParam, Errors, QueryParam, PathParam, Preprocessor } from 'typescript-rest';
import { RequestExtended } from '../interfaces/request-extended.interface';
import { MatchBet } from '../models/match-bet.model';
import { MatchBetBreakdown } from '../interfaces/match-bet-breakdown.interface';
import { MemberPreprocessor } from '../preprocessors/member.preprocessor';
import { AdminPreprocessor } from '../preprocessors/admin.preprocessor';
import * as escape from 'pg-escape';
import { MatchBetExpanded } from '../models/match-bet-expanded.model';
import { QueryResult } from 'pg';
import { Match } from '../models/match.model';

@Path('/bet')
export class BetEndpoint {

  @Path('/match')
  @POST
  @Preprocessor(MemberPreprocessor)
  placeMatchBet(
    @ContextRequest { pool, session }: RequestExtended,
    @FormParam('match_id') match_id: number,
    @FormParam('prediction') prediction: number,
    @FormParam('wager') wager: number,
  ): Promise<MatchBet> {

    if (typeof match_id !== 'number') {
      throw new Errors.BadRequestError('match_id must be a number');
    }

    if (typeof prediction !== 'number') {
      throw new Errors.BadRequestError('prediction must be a number');
    }

    if (typeof wager !== 'number') {
      throw new Errors.BadRequestError('wager must be a number');
    }
    let newCoins: number;

    const checkMatchQuery = 'SELECT * FROM matches WHERE id=' + match_id;
    return pool.query(checkMatchQuery).then((response) => {

      const match: Match = new Match(response.rows[0]);

      if (match.state !== 'pending') {
        throw new Errors.BadRequestError('You can\'t bet on that match');
      }

      const getCoinsQuery = 'SELECT coins FROM profiles WHERE id=' + session.profile.id;
      return pool.query(getCoinsQuery).then((response: { rows: { coins: number }[] }) => {

        const myCoins = response.rows[0].coins;
        if (myCoins < wager) {
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
        throw new Error('Something went wrong checking how many coins you have.');
      }).then((updated: any) => {
        session.profile.coins = newCoins;
        return new MatchBet(updated[1].rows[0]);
      }, err => {
        console.error(err);
        throw new Error('Something went wrong creating the bet.');
      });

    });

  }

  @Path('/match')
  @GET
  @Preprocessor(MemberPreprocessor)
  getMyMatchBets(
    @ContextRequest { pool, session }: RequestExtended,
    @QueryParam('order') order: (keyof MatchBet) = 'date',
    @QueryParam('direction') direction: 'ASC' | 'DESC' = 'ASC',
  ): Promise<MatchBetExpanded[]> {

    if (direction !== 'ASC' && direction !== 'DESC') {
      throw new Errors.BadRequestError('Invalid direction');
    }

    return new Promise((resolve, reject) => {

      const getMyBetsQuery = 'SELECT ' +
        'prediction, wager, outcome, ' +
        'entrant1id, entrant2id, entrant1tag, entrant2tag, round, round_order, ' +
        'name AS tournament ' +
        'FROM match_bets, matches, events ' +
        'WHERE match_bets.match_id = matches.id AND events.id = matches.event_id AND profile_id = ' + session.profile.id +
        ' ORDER BY %I ' + direction;

      pool.query(escape(getMyBetsQuery, order), (err, response) => {
        if (err) {
          console.error(err);
          reject(new Errors.InternalServerError('Something went wrong fetching the bets.'));
        } else {
          resolve(response.rows.map(b => new MatchBetExpanded(b)));
        }
      });

    });

  }

  @Path('/match/breakdown/:match_id')
  @GET
  @Preprocessor(AdminPreprocessor)
  getBetsOnMatch(
    @ContextRequest { pool, session }: RequestExtended,
    @PathParam('match_id') match_id: number,
  ): Promise<MatchBetBreakdown> {

    return new Promise((resolve, reject) => {

      let getTotalWagerOnSetQuery = 'SELECT * FROM match_bets WHERE match_id=' + match_id;
      pool.query(getTotalWagerOnSetQuery, (err, response) => {
        if (err) {
          console.error(err);
          reject(new Errors.InternalServerError('Something went wrong fetching the bet wagers'));
        } else {

          const breakdown: MatchBetBreakdown = {
            total: 0,
          };

          response.rows.forEach((row: MatchBet) => {

            breakdown.total += row.wager;

            if (!breakdown.hasOwnProperty(row.prediction)) {
              breakdown[row.prediction] = 0;
            }
            breakdown[row.prediction] += row.wager;

          });

          resolve(breakdown);

        }
      });

    });

  }

}