import { Inject } from '@andrei-tatar/ts-ioc';
import * as admin from 'firebase-admin';

import { Config } from '../config';
import { ConfigService } from './config.service';

export class AdminFirebaseService {
    public readonly app: admin.app.App;
    public readonly firestore: FirebaseFirestore.Firestore;
    public readonly auth: admin.auth.Auth;

    constructor(@Inject(ConfigService) config: Config) {
        if (config.serviceAccount.val.client_email &&
            config.serviceAccount.val.private_key &&
            config.serviceAccount.val.project_id) {
            console.log('AdminFirebaseService:', config.serviceAccount.val);
            this.app = admin.initializeApp({
                credential: admin.credential.cert({
                    clientEmail: config.serviceAccount.client_email.val,
                    projectId: config.serviceAccount.project_id.val,
                    privateKey: config.serviceAccount.private_key.val
                })
            });
        } else {
            console.log('AdminFirebaseService: implicit initialize');
            this.app = admin.initializeApp();
        }
        this.firestore = this.app.firestore();
        this.auth = this.app.auth();
    }

    async verifyToken(token: string) {
        const decoded = await this.auth.verifyIdToken(token);
        if (decoded.firebase.sign_in_provider === 'password') {
            if (decoded.uid !== 'SaZLefUTKJYSPTbb2PrZRsU0Sr33') {
                throw new Error('Only test user can login with e-mail/password');
            }
        }
        console.log('verifyToken:', token, decoded);
        return {
            uid: decoded.uid,
            email: decoded.email as string,
            name: decoded.name as string,
        };
    }
}
