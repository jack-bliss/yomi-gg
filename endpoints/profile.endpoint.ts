import { Path, GET, ContextRequest } from 'typescript-rest';
import { RequestExtended } from '../interfaces/request-extended.interface';
import { PublicProfile } from '../models/public-profile.model';

@Path('/profile')
export class ProfileEndpoint {

  @GET
  getProfileById(
    @ContextRequest { pool }: RequestExtended,
  ): Promise<PublicProfile[]> {

    const query = 'SELECT id,username,joined,type FROM profiles';

    return new Promise((resolve, reject) => {
      pool.query(query, (err, result) => {
        resolve(result.rows.map(p => new PublicProfile(p)));
      });
    });

  }

}