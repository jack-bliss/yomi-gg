import * as express from 'express';
import { Pool } from 'pg';
import * as session from 'express-session';
import * as pgSession from 'connect-pg-simple';
import { Server } from 'typescript-rest';

import { ProfilesEndpoint } from './src/endpoints/profiles.endpoint';
import { RequestExtended } from './src/interfaces/request-extended.interface';
import { AuthEndpoint } from './src/endpoints/auth.endpoint';
import { join } from 'path';
import { SmashggEndpoint } from './src/endpoints/smashgg.endpoint';
import { readFile } from 'fs';
import { Response } from 'express';
import { BetEndpoint } from './src/endpoints/bet.endpoint';
import { MemberPreprocessor } from './src/preprocessors/member.preprocessor';
import { AdminPreprocessor } from './src/preprocessors/admin.preprocessor';
import { EventsEndpoint } from './src/endpoints/events.endpoint';
import { MatchesEndpoint } from './src/endpoints/matches.endpoint';
import { PayoutEndpoint } from './src/endpoints/payout.endpoint';
import Timer = NodeJS.Timer;
import { CheckTournaments } from './src/periodics/check-tournaments.periodic';
import { UpdateTournament } from './src/smashgg/update-tournament';
import { queuePromiseFactories } from './src/utility/queuePromiseFactories';
import { CheckMatches } from './src/periodics/check-matches.periodic';
import { Match } from './src/models/match.model';
import { MatchBetPayout } from './src/payouts/match-bet.payout';

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
  ProfilesEndpoint,
  AuthEndpoint,
  SmashggEndpoint,
  BetEndpoint,
  EventsEndpoint,
  MatchesEndpoint,
  PayoutEndpoint,
);

const TournamentUpdateInterval: Timer = setInterval(() => {

  CheckTournaments(pool).then(events => {

    let Factories: (() => Promise<any>)[] = [];
    events.forEach(event => {
      Factories = [...Factories, ...event.phase_group.split(',').map(id => {
        return () => UpdateTournament(event.id, parseInt(id), event.slug, pool)
      })];
    });

    queuePromiseFactories(Factories)
      .then(() => {
        return CheckMatches(pool);
      })
      .then((matches: Match[]) => {
        if (matches.length) {
          console.log('paying out:', matches.map(m => m.event_id + ':' + m.round).join(', '));
        }
        return queuePromiseFactories(matches.map(m =>  {
          return () => MatchBetPayout(m.id, pool);
        }));
      });

  });

}, 10 * 1000);

app.use(express.static('dist'));
app.use(express.static('src/staticpages'));

app.get('/admin', (req: RequestExtended, res: Response) => {

  try {
    AdminPreprocessor(req);
  } catch(e) {
    res.redirect('/log-in');
    return;
  }

  res.sendFile(join(__dirname, './src/client/app.html'));

});

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, './src/client/app.html'));
});


app.listen(port, () => {
  console.log(`Server started on ${port}`);
});
