import { Path, GET, ContextRequest, QueryParam, Preprocessor, Errors } from 'typescript-rest';
import { RequestExtended } from '../interfaces/request-extended.interface';
import { PublicProfile } from '../models/public-profile.model';
import { AdminPreprocessor } from '../preprocessors/admin.preprocessor';
import { MemberPreprocessor } from '../preprocessors/member.preprocessor';
import { Profile } from '../models/profile.model';
import * as escape from 'pg-escape';
import { MatchBetExpanded } from '../models/match-bet-expanded.model';

@Path('/profile')
export class ProfileEndpoint {

  publicFields = PublicProfile.fields;

  @GET
  @Preprocessor(AdminPreprocessor)
  getProfiles(
    @QueryParam('order') order: (keyof PublicProfile) = 'id',
    @QueryParam('direction') direction: 'ASC' | 'DESC' = 'ASC',
    @ContextRequest { pool }: RequestExtended,
  ): Promise<PublicProfile[]> {

    if (direction !== 'ASC' && direction !== 'DESC') {
      throw new Errors.BadRequestError('direction is invalid');
    }

    const query =
      'SELECT ' +
      this.publicFields.join(', ') + ', ' +
      'count(*) OVER() AS total ' +
      'FROM profiles ORDER BY ' +
      '%I ' + direction;

    return new Promise((resolve, reject) => {
      pool.query(escape(query, order), (err, result) => {
        if (err) {
          console.error(err);
          throw new Error('An error occurred');
        }
        resolve(result.rows.map(p => new PublicProfile(p)));
      });
    });

  }

  @Path('/me')
  @GET
  @Preprocessor(MemberPreprocessor)
  getMyProfile(
    @ContextRequest { pool, session }: RequestExtended,
  ): Promise<Profile> {
    const query = 'SELECT * FROM profiles WHERE id=' + session.profile.id;
    return pool.query(query).then(response => {
      return new Profile(response.rows[0]);
    });
  }

  @Path('/highest/total')
  @GET
  @Preprocessor(AdminPreprocessor)
  getHighestCoins(
    @ContextRequest { pool }: RequestExtended,
  ): Promise<Profile[]> {
    const query = 'SELECT * FROM profiles ORDER BY coins DESC';
    return pool.query(query).then(response => {
      return response.rows.map(p => new Profile(p));
    })
  }

  @Path('/highest/payout')
  @GET
  @Preprocessor(AdminPreprocessor)
  getHighestPayout(
    @ContextRequest { pool }: RequestExtended,
  ): Promise<{
    username: string,
    bet: MatchBetExpanded,
  }[]> {
    const query = 'select ' +
      'distinct on (profile_id) profile_id, winnings, prediction, wager, outcome, ' +
      'username, ' +
      'round, round_order, entrant1id, entrant2id, entrant1tag, entrant2tag, winner, ' +
      'name as tournament ' +
      'from match_bets, profiles, matches, events ' +
      'where ' +
      'match_bets.profile_id = profiles.id and ' +
      'match_bets.match_id = matches.id and ' +
      'matches.event_id = events.id ' +
      'order by profile_id, winnings desc nulls last';
    return pool.query(query).then(response => {
      return response.rows.map(row => {
        return {
          username: String(row.username),
          bet: new MatchBetExpanded(row),
        };
      });
    });
  }

}