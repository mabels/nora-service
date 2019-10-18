import { Inject } from '@andrei-tatar/ts-ioc';
import * as admin from 'firebase-admin';
import { Token } from '../services/user-token';
import { Config } from './config';
import { ConfigService } from './config.service';

export class FirebaseService {

    private _config?: Config;

    constructor(
        @Inject('ConfigService')
        private readonly config: ConfigService
    ) {
    }

    async getConfig() {
        if (!this._config) {
            this._config = await this.config.init();
            if (typeof this._config.serviceAccountPrivateKey === 'string') {
                console.log(`FireBaseService:fromConfig`);
                admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId: this._config.projectId,
                        clientEmail: this._config.serviceAccountIssuer,
                        privateKey: this._config.serviceAccountPrivateKey,
                    })
                });
            } else {
                console.log(`FireBaseService:fromGoogle`);
                admin.initializeApp();
            }
        }
        return this._config;
    }

    async sign<T extends Token>(payload: T): Promise<string> {
    // admin.auth().createProviderConfig()
       if (!payload.uid) {
          throw Error('sign !uid not implement' + JSON.stringify(payload));
       }
       const x = admin.auth().createCustomToken(payload.uid, payload);
       console.log('sign:', JSON.stringify(payload, undefined, 2), x);
       return x;
    }

    async verifyToken(token: string) {
        await this.getConfig();
        const decoded = await admin.auth().verifyIdToken(token);
        if (decoded.firebase.sign_in_provider === 'password') {
            if (decoded.uid !== 'SaZLefUTKJYSPTbb2PrZRsU0Sr33') {
                throw new Error('Only test user can login with e-mail/password');
            }
        }
        return {
            uid: decoded.uid,
            email: decoded.email as string,
            name: decoded.name as string,
        };
    }
}
