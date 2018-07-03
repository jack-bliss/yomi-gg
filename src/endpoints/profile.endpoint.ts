import { Path, GET, ContextRequest, QueryParam } from 'typescript-rest';
import { RequestExtended } from '../interfaces/request-extended.interface';
import { PublicProfile } from '../models/public-profile.model';
import { ResponsePage } from '../interfaces/response-page.interface';

@Path('/profile')
export class ProfileEndpoint {

  publicFields = PublicProfile.fields;

  @GET
  getProfileById(
    @QueryParam('order') order: (keyof PublicProfile) = 'id',
    @ContextRequest { pool }: RequestExtended,
  ): Promise<PublicProfile[]> {

    const query =
      'SELECT ' +
      this.publicFields.join(', ') + ', ' +
      'count(*) OVER() AS total ' +
      'FROM profiles ORDER BY ' +
      order;

    return new Promise((resolve, reject) => {
      pool.query(query, (err, result) => {
        if (err) {
          console.error(err);
          throw new Error('An error occurred');
        }
        resolve(result.rows.map(p => new PublicProfile(p)));
      });
    });

  }

}