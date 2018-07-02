import { RequestExtended } from '../interfaces/request-extended.interface';
import { Errors } from 'typescript-rest';

export const AdminPreprocessor = (req: RequestExtended): RequestExtended => {

  if (req.session.hasProperties('profile') && req.session.profile.type === 'admin') {

    return req;

  } else {

    throw new Errors.UnauthorizedError('You must be an admin to do that.');

  }

};