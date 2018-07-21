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
  ProfileEndpoint,
  AuthEndpoint,
  SmashggEndpoint,
  BetEndpoint,
  EventsEndpoint,
  MatchesEndpoint,
  PayoutEndpoint,
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

  readFile(join(__dirname, './src/pages/bet.html'), 'utf-8', (err, data: string) => {
    res.send(data.replace(
      '%%user_info%%',
      '<h2>' + req.session.profile.username + '</h2><h4>' + req.session.profile.coins + '</h4>'
    ));
  });

});

app.get('/admin', (req: RequestExtended, res: Response) => {

  try {
    AdminPreprocessor(req);
  } catch(e) {
    res.redirect('/');
    return;
  }

  res.sendFile(join(__dirname, './src/pages/admin.html'));

});

const TournamentUpdateInterval: Timer = setInterval(() => {

  CheckTournaments(pool).then(events => {

    console.log('Updating', events.map(e => e.name).join(', '));

    queuePromiseFactories(events.map(e => {
      return () => UpdateTournament(e.id, pool);
    }))
      .then(() => {
        console.log('updated events');
        return CheckMatches(pool);
      })
      .then((matches: Match[]) => {
        console.log('paying out:', matches.map(m => m.event_id + ':' + m.round).join(', '));
        return queuePromiseFactories(matches.map(m =>  {
          return () => MatchBetPayout(m.id, pool);
        }));
      }).then(() => {
        console.log('payed out matches');
      });

    // const promiseFactories: (() => Promise<void>)[] = events.map(event => {
    //   return () => UpdateTournament(event.id, pool);
    // });
    //
    // const fullChain = promiseFactories.reduce((chain, next) => {
    //   return chain.then(next);
    // }, Promise.resolve());
    //
    // fullChain.then(() => {
    //   console.log('Updated events');
    // });

  });

}, 10 * 1000);

app.listen(port, () => {
  console.log(`Server started on ${port}`);
});
