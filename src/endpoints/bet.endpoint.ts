import { Path, POST, GET, PathParam, ContextRequest, FormParam, Errors } from 'typescript-rest';
import { RequestExtended } from '../interfaces/request-extended.interface';
import { SetBet } from '../models/set-bet.model';

@Path('/bet')
export class BetEndpoint {

  @Path('/set')
  @POST
  placeBet(
    @ContextRequest { pool, session }: RequestExtended,
    @FormParam('set') set: number,
    @FormParam('prediction') prediction: number,
    @FormParam('wager') wager: number,
  ): Promise<SetBet> {

    return new Promise((resolve, reject) => {

      if (!session.profile_id) {
        throw new Errors.UnauthorizedError('You must be logged in to do that.');
      }

      const getCoinsQuery = 'SELECT coins FROM profiles WHERE id=' + session.profile_id;
      console.log(getCoinsQuery);

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
            'UPDATE profiles SET coins=' + newCoins + ' WHERE id=' + session.profile_id + '; ' +
            'INSERT INTO set_bets (profile_id, set_id, prediction, wager) VALUES(' +
            session.profile_id + ', ' +
            set + ', ' +
            prediction + ', ' +
            wager + ') RETURNING *';
          console.log(createBetQuery);
          pool.query(createBetQuery, (err, updated) => {
            if (err) {
              console.error(err);
              reject(new Error('Something went wrong creating the bet.'));
            } else {
              console.log(updated);
              session.coins = newCoins;
              resolve(new SetBet(updated.rows[0]));
            }
          });

        }
      })

  });

  }

}