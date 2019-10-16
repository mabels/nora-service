import { Inject } from '@andrei-tatar/ts-ioc';
import { sign, SignOptions, verify, VerifyOptions } from 'jsonwebtoken';
import { ConfigService } from './config.service';

export class JwtService {
    @Inject('ConfigService')
    private configSrv: ConfigService;

    sign(payload: any, options?: SignOptions) {
        return new Promise<string>(async (resolve, reject) =>
        sign(payload, (await this.configSrv.init()).jwtSecret, options, (err, token) => {
            if (err) { reject(err); } else { resolve(token); }
        }));
    }

    verify<T = any>(token: string, options?: VerifyOptions) {
        return new Promise<T>(async (resolve, reject) =>
            verify(token, (await this.configSrv.init()).jwtSecret, options, (err, decoded) => {
            if (err) { reject(err); } else { resolve(decoded as any); }
        }));
    }
}
