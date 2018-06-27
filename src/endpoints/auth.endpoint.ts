import { ContextRequest, GET, Path, POST, QueryParam, Errors, FormParam } from 'typescript-rest';
import { AuthData } from '../interfaces/auth-data.interface';
import { EmailValidator } from '../validators/email.validator';
import { PasswordValidator } from '../validators/password.validator';
import { Profile } from '../models/profile.model';
import { Token } from '../interfaces/token.interface';
import { RequestExtended } from '../interfaces/request-extended.interface';
import * as bcrypt from 'bcrypt';
import { QueryArrayResult } from 'pg';

@Path('/auth')
export class AuthEndpoint {

  @Path('/sign-up')
  @POST
  signUp(
    @ContextRequest { pool, session }: RequestExtended,
    @FormParam('email') email: string,
    @FormParam('username') username: string,
    @FormParam('password') password: string,
  ): Promise<Profile & Token> {

    return new Promise((resolve, reject) => {

      if (!EmailValidator(email)) {
        throw new Errors.BadRequestError('That email is invalid.');
      }

      if (!PasswordValidator(password)) {
        throw new Errors.BadRequestError('That password is invalid.');
      }

      bcrypt.hash(password, 10).then((hashedPW: string) => {

        const query = 'INSERT INTO profiles ' +
          '(username, password, email, verified, coins, joined, type) ' +
          'VALUES(' +
          '\'' + username + '\', ' +
          '\'' + hashedPW + '\', ' +
          '\'' + email + '\', ' +
          'TRUE, ' +
          '5, ' +
          '\'' + (new Date()).toISOString() + '\', ' +
          '\'' + 'member\'' +
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
    @ContextRequest { pool, session }: RequestExtended,
    @FormParam('email') email: string,
    @FormParam('password') password: string,
  ): Promise<Profile & Token> {

    return new Promise((resolve, reject) => {

      if (!EmailValidator(email)) {
        throw new Errors.BadRequestError('That email is invalid.');
      }

      if (!PasswordValidator(password)) {
        throw new Errors.BadRequestError('That password is invalid.');
      }

      pool.query('SELECT * FROM profiles where email=\'' + email +'\'', (err, result) => {
        if (err) {
          console.error(err);
          throw new Errors.InternalServerError('An error occurred: ' + JSON.stringify(err));
        }
        if (!result.rows.length) {
          throw new Errors.NotFoundError('That email address isn\'t registered.');
        } else {
          bcrypt.compare(password, result.rows[0].password, (err, same) => {
            if (same) {
              session.profile_id = result.rows[0].id;
              resolve({
                ...new Profile(result.rows[0]),
                token: session.id,
              })
            } else {
              throw new Errors.BadRequestError('That is the wrong password.');
            }
          })
        }
      });

    });

  }

  @Path('/email-exists')
  @GET
  emailExists(
    @ContextRequest { pool }: RequestExtended,
    @QueryParam('email') email: string,
  ): Promise<boolean> {

    const query = 'SELECT id FROM profiles WHERE email=\'' + email + '\'';

    return new Promise((resolve, reject) => {

      if (!EmailValidator(email)) {
        throw new Errors.BadRequestError('That email is invalid.');
      }
      pool.query(query, (err, result) => {
        if (err) {
          console.error(err);
          throw new Error('An error occurred');
        }
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
    const query = 'SELECT id FROM profiles WHERE username=\'' + username + '\'';
    return new Promise((resolve, reject) => {
      pool.query(query, (err, result) => {
        if (err) {
          console.error(err);
          throw new Error('An error occurred');
        }
        resolve(result.rows.length > 0);
      });
    });
  }

}