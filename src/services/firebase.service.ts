import { Inject } from '@andrei-tatar/ts-ioc';
import * as admin from 'firebase-admin';

import { Config } from '../config';
import { ConfigService } from './config.service';

export class FirebaseService {
    public readonly app: admin.app.App;
    public readonly firestore: FirebaseFirestore.Firestore;

    constructor(@Inject(ConfigService) config: Config) {
        this.app = admin.initializeApp({
            credential: admin.credential.cert({
                clientEmail: config.serviceAccount.client_email.val,
                projectId: config.serviceAccount.project_id.val,
                privateKey: config.serviceAccount.private_key.val
            })
        });
        this.firestore = this.app.firestore();
    }

    async verifyToken(token: string) {
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
