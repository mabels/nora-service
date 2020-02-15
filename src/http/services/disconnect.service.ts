import { Inject } from '@andrei-tatar/ts-ioc';
import { LogService } from '../../services/log-service';
import { UserRepository } from '../../services/user.repository';

export class DisconnectService {
    constructor(
        @Inject('uid')
        private uid: string,
        private userRepo: UserRepository,
        @Inject(LogService) private log: LogService
    ) {
    }

    async disconnect() {
        await this.userRepo.updateUserLinked(this.uid, false);
        this.log.info(`user ${this.uid} unlinked from google home`);
    }
}

