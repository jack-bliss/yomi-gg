import { ContextRequest, GET, Path, POST, QueryParam, Errors } from 'typescript-rest';
import { AuthData } from '../interfaces/auth-data.interface';
import { EmailValidator } from '../validators/email.validator';
import { PasswordValidator } from '../validators/password.validator';
import { Profile } from '../models/profile.model';
import { Token } from '../interfaces/token.interface';
import { RequestExtended } from '../interfaces/request-extended.interface';
import * as bcrypt from 'bcrypt';

@Path('/auth')
export class AuthEndpoint {

  @Path('/sign-up')
  @POST
  signUp(
    @ContextRequest { pool, session }: RequestExtended,
    signUp: AuthData,
  ): Promise<Profile & Token> {

    return new Promise((resolve, reject) => {

      if (!EmailValidator(signUp.email)) {
        throw new Errors.BadRequestError('That email is invalid.');
      }

      if (!PasswordValidator(signUp.password)) {
        throw new Errors.BadRequestError('That password is invalid.');
      }

      bcrypt.hash(signUp.password, 10).then((hashedPW: string) => {

        const query = 'INSERT INTO profiles ' +
          '(username, password, email, verified, coins, joined, type) ' +
          'VALUES(' +
          signUp.username + ', ' +
          hashedPW + ', ' +
          signUp.email + ', ' +
          'TRUE, ' +
          '5, ' +
          (new Date()).toISOString() + ', ' +
          'member, ' +
          ') RETURNING *' ;

        pool.query(query, (err: any, result: { rows: Profile[] }) => {
          if (err) {
            reject(err);
          } else {
            session.profile_id = result.rows[0].id;
            resolve(
              {
                ...(new Profile(result.rows[0])),
                token: session.id,
              }
            );
          }
        });

      });

    });

  }

  @Path('/log-in')
  @POST
  logIn(
    @ContextRequest { pool }: RequestExtended,
    logIn: AuthData,
  ): Promise<Profile & Token> {

    return new Promise((resolve, reject) => {

      if (!EmailValidator(logIn.email)) {
        throw new Errors.BadRequestError('That email is invalid.');
      }

      if (!PasswordValidator(logIn.password)) {
        throw new Errors.BadRequestError('That password is invalid.');
      }

    });

  }

  @Path('/email-exists')
  @GET
  emailExists(
    @ContextRequest { pool }: RequestExtended,
    @QueryParam('email') email: string,
  ): Promise<boolean> {

    const query = 'SELECT id FROM profiles WHERE email=' + email;

    return new Promise((resolve, reject) => {

      if (!EmailValidator(email)) {
        throw new Errors.BadRequestError('That email is invalid.');
      }

      pool.query(query, (err, result) => {
        resolve(result.rows.length > 0);
      });
    });
  }

  @Path('/username-exists')
  @GET
  usernameExists(
    @ContextRequest { pool }: RequestExtended,
    @QueryParam('username') username: string,
  ): Promise<boolean> {
    const query = 'SELECT id FROM profiles WHERE username=' + username;
    return new Promise((resolve, reject) => {
      pool.query(query, (err, result) => {
        resolve(result.rows.length > 0);
      });
    });
  }

}