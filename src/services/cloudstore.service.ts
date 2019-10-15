// import { Pool } from 'pg';
// import { postgressConnectionString } from '../config';

export class CloudstoreService {

  async query<T = any>(query: string, ...values: any[]): Promise<T[]> {
      console.log('CloudstoreService:', query, values);
      // const result = await this.pool.query(query, values);
      return []; // result.rows;
  }
}
