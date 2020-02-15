import { Container } from '@andrei-tatar/ts-ioc';
import { Config } from '../config';
import { ConfigService } from './config.service';
import { UserRepositoryCloudStore } from './user.repository.cloudstore';
import { UserRepositoryPostgres } from './user.repository.postgres';
import { LogService } from './log-service';

export interface User {
    readonly uid: string;
    refreshtoken: number;
    noderedversion: number;
    linked: boolean;
}

export interface UserRepository {
    createUserRecordIfNotExists(uid: string): Promise<any[]>;
    getUser(uid: string): Promise<User>;
    isUserLinked(uid: string): Promise<boolean>;
    updateUserLinked(uid: string, linked: boolean): Promise<any[]>;
    getRefreshToken(uid: string): Promise<number | null>;
    getNodeRedTokenVersion(uid: string): Promise<number>;
    incrementNoderedTokenVersion(uid: string): Promise<void>;
}

export const UserRepositoryFactory = 'UserRepository';

export function userRepositoryFactory(container: Container) {
    const config = container.resolve<Config>(ConfigService);
    const log = container.resolve<LogService>(LogService);
    log.info('userRepositoryFactory', config.userRepositoryBackend.val);
    switch (config.userRepositoryBackend.val) {
        case 'fb':
            return container.resolve<UserRepository>(UserRepositoryCloudStore);
        default:
            return container.resolve<UserRepository>(UserRepositoryPostgres);
    }
}
