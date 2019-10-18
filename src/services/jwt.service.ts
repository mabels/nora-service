import { Inject } from '@andrei-tatar/ts-ioc';
// import { sign, SignOptions, verify, VerifyOptions } from 'jsonwebtoken';
// import { ConfigService } from './config.service';
import { FirebaseService } from './firebase.service';
import { Token } from './user-token';

export class JwtService {
    // @Inject('ConfigService')
    // private configSrv: ConfigService;

    @Inject(FirebaseService)
    private fireBaseSrv: FirebaseService;

    sign<T extends Token>(payload: T/*, options?: SignOptions*/): Promise<string> {
        const o = this.fireBaseSrv.sign(payload);
        // throw Error(`sign not implemend:${JSON.stringify(payload)}`);
        return o;
        /*
        return new Promise<string>(async (resolve, reject) =>
        sign(payload, (await this.configSrv.init()).jwtSecret, options, (err, token) => {
            if (err) { reject(err); } else { resolve(token); }
        }));
        */
    }

    verify<T = any>(token: string/*, options?: VerifyOptions*/): Promise<T> {
        throw Error(`sign not implemend:${token}`);
        /*
        return new Promise<T>(async (resolve, reject) =>
            verify(token, (await this.configSrv.init()).jwtSecret, options, (err, decoded) => {
            if (err) { reject(err); } else { resolve(decoded as any); }
        }));
        */
    }
}
