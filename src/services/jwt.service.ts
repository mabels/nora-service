import { Inject } from '@andrei-tatar/ts-ioc';
import { sign, verify } from 'jsonwebtoken';
import { ConfigService } from './config.service';
// import { FirebaseService } from './firebase.service';
import { Token } from './user-token';

export class JwtService {
    @Inject('ConfigService')
    private configSrv: ConfigService;

    // @Inject(FirebaseService)
    // private fireBaseSrv: FirebaseService;

    sign<T extends Token>(payload: T/*, options?: SignOptions*/): Promise<string> {
        return new Promise<string>(async (resolve, reject) =>
        sign(payload, (await this.configSrv.init()).jwtSecret, undefined, (err, token) => {
            if (err) { reject(err); } else { resolve(token); }
        }));
    }

    verify<T = any>(token: string/*, options?: VerifyOptions*/): Promise<T> {
        return new Promise<T>(async (resolve, reject) =>
            verify(token, (await this.configSrv.init()).jwtSecret, undefined, (err, decoded) => {
            if (err) { reject(err); } else { resolve(decoded as any); }
        }));
    }
}
