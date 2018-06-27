import { Request } from 'express';
import { Pool } from 'pg';

export interface RequestExtended extends Request {

  pool: Pool;

}