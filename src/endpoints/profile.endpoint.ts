import { Path, GET, ContextRequest, QueryParam, Preprocessor, Errors } from 'typescript-rest';
import { RequestExtended } from '../interfaces/request-extended.interface';
import { PublicProfile } from '../models/public-profile.model';
import { AdminPreprocessor } from '../preprocessors/admin.preprocessor';
import { MemberPreprocessor } from '../preprocessors/member.preprocessor';
import { Profile } from '../models/profile.model';
import * as escape from 'pg-escape';

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
    const query = 'SELECT * FROM profiles WHERE id=' + session.id;
    return pool.query(query).then(response => {
      return new Profile(response.rows[0]);
    });
  }

}