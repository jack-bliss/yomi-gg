import { Path, POST, GET, ContextRequest, FormParam, Errors, QueryParam, PathParam, Preprocessor } from 'typescript-rest';
import { RequestExtended } from '../interfaces/request-extended.interface';
import { MatchBet } from '../models/match-bet.model';
import { MatchBetBreakdown } from '../interfaces/match-bet-breakdown.interface';
import { MemberPreprocessor } from '../preprocessors/member.preprocessor';
import { AdminPreprocessor } from '../preprocessors/admin.preprocessor';

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

    return new Promise((resolve, reject) => {

      const getCoinsQuery = 'SELECT coins FROM profiles WHERE id=' + session.profile.id;

      pool.query(getCoinsQuery, (err, coins: { rows: { coins: number }[] }) => {
        if (err) {
          console.error(err);
          reject(new Error('Something went wrong checking how many coins you have.'));
        }
        const myCoins = coins.rows[0].coins;
        if (myCoins < wager) {
          reject(new Errors.BadRequestError('You don\'t have enough coins for that.'));
        } else {
          const newCoins = myCoins - wager;
          const createBetQuery =
            'UPDATE profiles SET coins=' + newCoins + ' WHERE id=' + session.profile.id + '; ' +
            'INSERT INTO match_bets (profile_id, match_id, prediction, wager) VALUES(' +
            session.profile.id + ', ' +
            match_id + ', ' +
            prediction + ', ' +
            wager +
            ') RETURNING *';
          pool.query(createBetQuery, (err, updated: any) => {
            if (err) {
              console.error(err);
              reject(new Error('Something went wrong creating the bet.'));
            } else {
              session.profile.coins = newCoins;
              resolve(new MatchBet(updated[1].rows[0]));
            }
          });

        }
      })
    });

  }

  @Path('/match')
  @GET
  @Preprocessor(MemberPreprocessor)
  getMyMatchBets(
    @ContextRequest { pool, session }: RequestExtended,
    @QueryParam('order') order: string = 'date'
  ): Promise<MatchBet[]> {

    return new Promise((resolve, reject) => {

      const getMyBetsQuery = 'SELECT * FROM match_bets WHERE profile_id=' + session.profile.id;

      pool.query(getMyBetsQuery, (err, response) => {
        if (err) {
          console.error(err);
          reject(new Errors.InternalServerError('Something went wrong fetching the bets.'));
        } else {
          resolve(response.rows.map(b => new MatchBet(b)));
        }
      });

    });

  }

  @Path('/match/:match_id')
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