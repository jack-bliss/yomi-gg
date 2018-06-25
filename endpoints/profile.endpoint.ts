import { Path, GET, ContextRequest } from 'typescript-rest';
import { RequestExtended } from '../interfaces/request-extended.interface';

@Path('/profile')
export class ProfileEndpoint {

  @GET
  getProfileById(
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