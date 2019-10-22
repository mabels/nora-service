import { Inject, Lazy } from '@andrei-tatar/ts-ioc';
import { FirebaseService } from './firebase.service';
import { Token } from './user-token';
import { UserRepository } from './user.repository';

interface NoderedToken extends Token {
    readonly scope: 'node-red';
    readonly version: number;
}

export class NoderedTokenService {
    constructor(
        @Inject(FirebaseService)
        private fireBaseService: Lazy<FirebaseService>,
        @Inject(UserRepository)
        private userRepo: Lazy<UserRepository>
    ) {
    }

    async generateToken(uid: string) {
        const token: NoderedToken = {
            uid: uid,
            scope: 'node-red',
            version: await this.userRepo.value.getNodeRedTokenVersion(uid),
        };
        return this.fireBaseService.value.sign(token);
    }

    async validateToken(token: string) {
        const decoded = await this.fireBaseService.value.verifyToken(token);
        if (decoded.scope !== 'node-red') {
            throw new Error('invalid scope');
        }
        const version = await this.userRepo.value.getNodeRedTokenVersion(decoded.uid);
        if (version !== decoded.version) {
            throw new Error('token revoked');
        }
        return decoded.uid;
    }
}
