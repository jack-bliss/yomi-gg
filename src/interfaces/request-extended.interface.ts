import { Request } from 'express';
import { Pool } from 'pg';

export interface RequestExtended extends Request {

  session: any;
  pool: Pool;

}