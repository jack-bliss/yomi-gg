import * as express from 'express';
import { Pool } from 'pg';
import * as session from 'express-session';
import * as pgSession from 'connect-pg-simple';
import { Server } from 'typescript-rest';

import { ProfileEndpoint } from './src/endpoints/profile.endpoint';
import { RequestExtended } from './src/interfaces/request-extended.interface';
import { AuthEndpoint } from './src/endpoints/auth.endpoint';
import { join } from 'path';
import { SmashggEndpoint } from './src/endpoints/smashgg.endpoint';
import { readFile } from 'fs';
import { Request, Response } from 'express';
import { BetEndpoint } from './src/endpoints/bet.endpoint';
import { MemberPreprocessor } from './src/preprocessors/member.preprocessor';
import { AdminPreprocessor } from './src/preprocessors/admin.preprocessor';

const app: express.Application = express();

const port: number = parseInt(process.env.PORT) || 3000;

const pool = new Pool();

const PgSession = pgSession(session);

app.use(session({
  store: new PgSession({
    pool,
  }),
  secret: process.env.SECRET,
  resave: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
  saveUninitialized: false,
}));

app.use((req: RequestExtended, res, next) => {
  req.pool = pool;
  next();
});

Server.buildServices(
  app,
  ProfileEndpoint,
  AuthEndpoint,
  SmashggEndpoint,
  BetEndpoint,
);

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, './src/pages/index.html'));
});

app.get('/place-a-bet', (req: RequestExtended, res: Response) => {

  try {
    MemberPreprocessor(req);
  } catch(e) {
    res.redirect('/');
    return;
  }

  readFile(join(__dirname, './src/pages/bet.html'), 'utf-8', (err, data) => {
    res.send(data.replace(
      '%%user_info%%',
      '<h2>' + req.session.profile.username + '</h2><h4>' + req.session.profile.coins + '</h4>'
    ));
  });

});

app.get('/admin', (req: RequestExtended, res: Response) => {

  try {
    console.log(req.session.profile);
    AdminPreprocessor(req);
  } catch(e) {
    console.log(e);
    res.redirect('/');
    return;
  }

  console.log('sending admin page');

  res.sendFile(join(__dirname, './src/pages/admin.html'));

});

app.listen(port, () => {
  console.log(`Server started on ${port}`);
});
