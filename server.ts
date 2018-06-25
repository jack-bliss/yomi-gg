import * as express from 'express';
import { Pool } from 'pg';
import * as session from 'express-session';
import * as PgSession from 'connect-pg-simple';
import { Server } from 'typescript-rest';

import * as bcrypt from 'bcrypt';
import { ProfileEndpoint } from './endpoints/profile.endpoint';


const app: express.Application = express();

const port: number = parseInt(process.env.PORT) || 3000;

const pool = new Pool();

app.use(session({
  store: new PgSession({
    pool,
    tableName: 'session',
  }),
  secret: process.env.SECRET,
  resave: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
}));

app.use((req, res, next) => {
  req.pool = pool;
  next();
});

Server.buildServices(
  app,
  ProfileEndpoint,
);

app.listen(port, () => {
  console.log(`Server started on ${port}`);
});
