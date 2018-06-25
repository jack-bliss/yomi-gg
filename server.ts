
import * as express from 'express';

const app: express.Application = express();

const port: number = parseInt(process.env.PORT) || 3000;



app.listen(port, () => {
  console.log(`Server started on ${port}`);
});
