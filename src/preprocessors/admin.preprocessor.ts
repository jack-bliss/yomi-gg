import { RequestExtended } from '../interfaces/request-extended.interface';
import { Errors } from 'typescript-rest';

export const AdminPreprocessor = (req: RequestExtended): RequestExtended => {

  console.log('user has profile');
  console.log(req.session.profile);

  if (req.session.hasProperties('profile') && req.session.profile.type === 'admin') {

    return req;

  } else {

    console.log('not an admin!');

    throw new Errors.UnauthorizedError('You must be an admin to do that.');

  }

};