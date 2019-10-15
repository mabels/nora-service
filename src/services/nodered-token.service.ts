import { Injectable, Inject, Lazy } from '@andrei-tatar/ts-ioc';
import { JwtService } from './jwt.service';
import { UserRepository } from './user.repository';

interface NoderedToken {
    readonly uid: string;
    readonly scope: 'node-red';
    readonly version: number;
}

@Injectable()
export class NoderedTokenService {
    constructor(
        private jwtService: JwtService,
        @Inject('UserRepository')
        private userRepo: Lazy<UserRepository>
    ) {
    }

    async generateToken(uid: string) {
        const token: NoderedToken = {
            uid: uid,
            scope: 'node-red',
            version: await this.userRepo.value.getNodeRedTokenVersion(uid),
        };
        return this.jwtService.sign(token);
    }

    async validateToken(token: string) {
        const decoded = await this.jwtService.verify<NoderedToken>(token);
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
