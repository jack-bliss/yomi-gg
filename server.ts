import * as express from 'express';
import { Pool } from 'pg';
import * as session from 'express-session';
import * as pgSession from 'connect-pg-simple';
import { Server } from 'typescript-rest';

import { ProfileEndpoint } from './src/endpoints/profile.endpoint';
import { RequestExtended } from './src/interfaces/request-extended.interface';
import { AuthEndpoint } from './src/endpoints/auth.endpoint';
import { join } from 'path';


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
);

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, './src/index.html'));
});

app.listen(port, () => {
  console.log(`Server started on ${port}`);
});
