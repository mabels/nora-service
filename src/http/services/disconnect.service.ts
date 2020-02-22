import { Inject } from '@andrei-tatar/ts-ioc';

import { LogService } from '../../services/log-service';
import { UserRepository, UserRepositoryFactory } from '../../services/user.repository';

export class DisconnectService {
    constructor(
        @Inject(UserRepositoryFactory) private userRepo: UserRepository,
        @Inject(LogService) private log: LogService
    ) {
    }

    async disconnect(uid: string) {
        await this.userRepo.updateUserLinked(uid, false);
        this.log.info(`user ${uid} unlinked from google home`);
    }
}

