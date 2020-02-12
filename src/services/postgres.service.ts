import { Inject } from '@andrei-tatar/ts-ioc';
import { Pool } from 'pg';
import { Config } from '../config';
import { ConfigService } from './config.service';

export class PostgresService {
    readonly HOUR = 3600000;
    private readonly pool: Pool;

    constructor(@Inject(ConfigService) config: Config) {
        this.pool = new Pool(config.postgres.val);
    }

    async query<T = any>(query: string, ...values: any[]): Promise<T[]> {
        const result = await this.pool.query(query, values);
        return result.rows;
    }
}
