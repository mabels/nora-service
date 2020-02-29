// import { Inject } from '@andrei-tatar/ts-ioc';
import { sign, SignOptions, verify, VerifyOptions } from 'jsonwebtoken';

// key: string, import { Config } from '../config';
// import { ConfigService } from './config.service';

export class JwtService {

    // constructor(@Inject(ConfigService) private config: Config) {
    // }

    sign(payload: any, key: string, options?: SignOptions) {
        return new Promise<string>((resolve, reject) => sign(payload, key, options, (err, token) => {
            if (err) { reject(err); } else { resolve(token); }
        }));
    }

    verify<T = any>(token: string, key: string, options?: VerifyOptions) {
        return new Promise<T>((resolve, reject) => verify(token, key, options, (err, decoded) => {
            if (err) { reject(err); } else { resolve(decoded as any); }
        }));
    }
}
