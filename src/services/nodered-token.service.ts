import { Inject } from '@andrei-tatar/ts-ioc';

import { Config } from '../config';
import { ConfigService } from './config.service';
import { JwtService } from './jwt.service';
import { UserRepository, UserRepositoryFactory } from './user.repository';

interface NoderedToken {
    uid: string;
    scope: string;
    version: number;
}

export class NoderedTokenService {
    constructor(
        @Inject(JwtService)
        private jwtService: JwtService,
        @Inject(UserRepositoryFactory)
        private userRepo: UserRepository,
        @Inject(ConfigService)
        private config: Config
    ) {
    }

    async generateToken(uid: string) {
        console.log('generateToken', uid);
        console.log('userRepo', this.userRepo);
        console.log('jwtSerivce', this.jwtService);
        const token: NoderedToken = {
            uid: uid,
            scope: this.config.noraServiceUrl.val,
            version: await this.userRepo.getNodeRedTokenVersion(uid),
        };
        return this.jwtService.sign(token);
    }

    async validateToken(token: string) {
        const decoded = await this.jwtService.verify<NoderedToken>(token);
        if (decoded.scope !== this.config.noraServiceUrl.val) {
            throw new Error(`invalid scope:${decoded.scope}`);
        }
        const version = await this.userRepo.getNodeRedTokenVersion(decoded.uid);
        if (version !== decoded.version) {
            throw new Error('token revoked');
        }
        return decoded.uid;
    }
}
