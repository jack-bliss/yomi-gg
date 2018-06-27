import { Path, POST, GET, ContextRequest, FormParam, Errors, QueryParam, PathParam } from 'typescript-rest';
import { RequestExtended } from '../interfaces/request-extended.interface';
import { SetBet } from '../models/set-bet.model';
import { SetBetBreakdown } from '../interfaces/set-bet-breakdown.interface';

@Path('/bet')
export class BetEndpoint {

  @Path('/set')
  @POST
  placeSetBet(
    @ContextRequest { pool, session }: RequestExtended,
    @FormParam('set') set: number,
    @FormParam('prediction') prediction: number,
    @FormParam('wager') wager: number,
  ): Promise<SetBet> {

    return new Promise((resolve, reject) => {

      if (!session.profile.id) {
        throw new Errors.UnauthorizedError('You must be logged in to do that.');
      }

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
            'INSERT INTO set_bets (profile_id, set_id, prediction, wager) VALUES(' +
            session.profile.id + ', ' +
            set + ', ' +
            prediction + ', ' +
            wager +
            ') RETURNING *';
          pool.query(createBetQuery, (err, updated: any) => {
            if (err) {
              console.error(err);
              reject(new Error('Something went wrong creating the bet.'));
            } else {
              session.profile.coins = newCoins;
              resolve(new SetBet(updated[1].rows[0]));
            }
          });

        }
      })
    });

  }

  @Path('/set')
  @GET
  getMySetBets(
    @ContextRequest { pool, session }: RequestExtended,
    @QueryParam('order') order: string = 'date'
  ): Promise<SetBet[]> {

    if (!session.profile.id) {
      throw new Errors.UnauthorizedError('You must be logged in to do that.');
    }

    return new Promise((resolve, reject) => {

      const getMyBetsQuery = 'SELECT * FROM set_bets WHERE profile_id=' + session.profile.id;

      pool.query(getMyBetsQuery, (err, response) => {
        if (err) {
          console.error(err);
          reject(new Errors.InternalServerError('Something went wrong fetching the bets.'));
        } else {
          resolve(response.rows.map(b => new SetBet(b)));
        }
      });

    });

  }

  @Path('/set/:set_id')
  @GET
  getBetsOnSet(
    @ContextRequest { pool, session }: RequestExtended,
    @PathParam('set_id') set_id: number,
  ): Promise<SetBetBreakdown> {

    if (session.profile.type !== 'admin') {
      throw new Errors.UnauthorizedError('Only admins can see total bet counts');
    }

    return new Promise((resolve, reject) => {

      let getTotalWagerOnSetQuery = 'SELECT * FROM set_bets WHERE set_id=' + set_id;
      pool.query(getTotalWagerOnSetQuery, (err, response) => {
        if (err) {
          console.error(err);
          reject(new Errors.InternalServerError('Something went wrong fetching the bet wagers'));
        } else {

          const breakdown: SetBetBreakdown = {
            total: 0,
          };

          response.rows.forEach((row: SetBet) => {

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