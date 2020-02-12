import { Inject, Injectable } from '@andrei-tatar/ts-ioc';

import { Config } from '../config';
import { JwtService } from './jwt.service';
import { UserRepository } from './user.repository';
import { ConfigService } from './config.service';

interface NoderedToken {
    uid: string;
    scope: string;
    version: number;
}

@Injectable()
export class NoderedTokenService {
    constructor(
        private jwtService: JwtService,
        private userRepo: UserRepository,
        @Inject(ConfigService)
        private config: Config
    ) {
    }

    async generateToken(uid: string) {
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
