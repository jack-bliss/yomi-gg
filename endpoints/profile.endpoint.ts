import { Path, GET, PathParam, ContextRequest } from 'typescript-rest';
import { RequestExtended } from '../interfaces/request-extended.interface';
import { Profile } from '../models/profile.model';

@Path('/profile')
export class ProfileEndpoint {

  @Path(':id')
  @GET
  getProfileById(
    @PathParam('id') id: number,
    @ContextRequest { pool }: RequestExtended,
  ): Promise<any> {

    const query = 'SELECT id,username,joined,type FROM profiles';

    return new Promise((resolve, reject) => {
      pool.query(query, [1], (err, result) => {
        resolve(result);
      });
    });

  }

}