import { ContextRequest, GET, Path, POST, QueryParam, Errors, FormParam } from 'typescript-rest';
import { EmailValidator } from '../validators/email.validator';
import { PasswordValidator } from '../validators/password.validator';
import { Profile } from '../models/profile.model';
import { Token } from '../interfaces/token.interface';
import { RequestExtended } from '../interfaces/request-extended.interface';
import * as bcrypt from 'bcrypt';
import * as escape from 'pg-escape';
import { ErrorCodes, setErrorCode } from '../errors/error-codes';

@Path('/auth')
export class AuthEndpoint {

  @Path('/sign-up')
  @POST
  signUp(
    @ContextRequest { pool, session, res }: RequestExtended,
    @FormParam('email') email: string,
    @FormParam('username') username: string,
    @FormParam('password') password: string,
  ): Promise<Profile & Token> {

    return new Promise((resolve, reject) => {

      if (!EmailValidator(email)) {
        setErrorCode(ErrorCodes.INVALID_EMAIL, res);
        throw new Errors.BadRequestError('That email is invalid.');
      }

      if (!PasswordValidator(password)) {
        setErrorCode(ErrorCodes.INVALID_PASSWORD, res);
        throw new Errors.BadRequestError('That password is invalid.');
      }

      bcrypt.hash(password, 10).then((hashedPW: string) => {

        const query = 'INSERT INTO profiles ' +
          '(username, password, email, verified, type) ' +
          'VALUES(' +
          '%L, ' +
          '%L, ' +
          '%L, ' +
          'TRUE, ' +
          '\'member\'' +
          ') RETURNING *' ;

        pool.query(
          escape(query, username, hashedPW, email.toLowerCase()),
          (err: any, result: { rows: Profile[] }) => {
          if (err) {
            setErrorCode(ErrorCodes.UNKNOWN, res);
            console.error(err);
            reject(new Errors.InternalServerError('An error occurred.'));
          } else {

            const me = new Profile(result.rows[0]);
            session.profile = { ...me };

            resolve({
              ...me,
              token: session.id,
            });
          }
        });

      });

    });

  }

  @Path('/log-in')
  @POST
  logIn(
    @ContextRequest { pool, session, res }: RequestExtended,
    @FormParam('email') email: string,
    @FormParam('password') password: string,
  ): Promise<Profile & Token> {

    return new Promise((resolve, reject) => {

      if (!EmailValidator(email)) {
        setErrorCode(ErrorCodes.INVALID_EMAIL, res);
        throw new Errors.BadRequestError('That email is invalid.');
      }

      if (!PasswordValidator(password)) {
        setErrorCode(ErrorCodes.INVALID_PASSWORD, res);
        throw new Errors.BadRequestError('That password is invalid.');
      }

      const query = 'SELECT * FROM profiles where email=%L';

      pool.query(
        escape(query, email.toLowerCase()),
        (err, result) => {
        if (err) {
          setErrorCode(ErrorCodes.UNKNOWN, res);
          console.error(err);
          reject(new Errors.InternalServerError('An error occurred: ' + JSON.stringify(err)));
        }
        if (!result.rows.length) {
          setErrorCode(ErrorCodes.UNKNOWN_EMAIL, res);
          reject(new Errors.NotFoundError('That email address isn\'t registered.'));
        } else {
          bcrypt.compare(password, result.rows[0].password, (err, same) => {
            if (same) {

              const me = new Profile(result.rows[0]);
              session.profile = { ...me };

              resolve({
                ...me,
                token: session.id,
              })
            } else {
              setErrorCode(ErrorCodes.WRONG_PASSWORD, res);
              reject(new Errors.BadRequestError('That is the wrong password.'));
            }
          })
        }
      });

    });

  }

  @Path('/email-exists')
  @GET
  emailExists(
    @ContextRequest { pool, res }: RequestExtended,
    @QueryParam('email') email: string,
  ): Promise<boolean> {

    const query = 'SELECT id FROM profiles WHERE email=%L';

    return new Promise((resolve, reject) => {

      if (!EmailValidator(email)) {
        setErrorCode(ErrorCodes.INVALID_EMAIL, res);
        throw new Errors.BadRequestError('That email is invalid.');
      }
      pool.query(
        escape(query, email.toLowerCase()),
        (err, result) => {
        if (err) {
          setErrorCode(ErrorCodes.UNKNOWN, res);
          console.error(err);
          reject(new Errors.InternalServerError('An error occurred'));
        } else {
          resolve(result.rows.length > 0);
        }
      });
    });
  }

  @Path('/username-exists')
  @GET
  usernameExists(
    @ContextRequest { pool, res }: RequestExtended,
    @QueryParam('username') username: string,
  ): Promise<boolean> {
    const query = 'SELECT id FROM profiles WHERE username=%L';
    return new Promise((resolve, reject) => {
      pool.query(escape(query, username), (err, result) => {
        if (err) {
          setErrorCode(ErrorCodes.UNKNOWN, res);
          console.error(err);
          reject(new Errors.InternalServerError('An error occurred'));
        } else {
          resolve(result.rows.length > 0);
        }
      });
    });
  }

}