import { Inject } from '@andrei-tatar/ts-ioc';
import { sign, SignOptions, verify, VerifyOptions } from 'jsonwebtoken';

import { Config } from '../config';
import { ConfigService } from './config.service';

export class JwtService {

    constructor(@Inject(ConfigService) private config: Config) {
    }

    sign(payload: any, key = this.config.jwtSecret.val, options?: SignOptions) {
        return new Promise<string>((resolve, reject) => sign(payload, key, options, (err, token) => {
            if (err) { reject(err); } else { resolve(token); }
        }));
    }

    verify<T = any>(token: string, options?: VerifyOptions) {
        return new Promise<T>((resolve, reject) => verify(token, this.config.jwtSecret.val, options, (err, decoded) => {
            if (err) { reject(err); } else { resolve(decoded as any); }
        }));
    }
}
