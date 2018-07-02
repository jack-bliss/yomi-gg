import { RequestExtended } from '../interfaces/request-extended.interface';
import { Errors } from 'typescript-rest';

export const MemberPreprocessor = (req: RequestExtended): RequestExtended => {

  if (req.session.hasOwnProperty('profile') && req.session.profile.hasOwnProperty('id')) {

    return req;

  } else {

    throw new Errors.UnauthorizedError('You must be logged in to do that.');

  }

};