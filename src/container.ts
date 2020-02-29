import { Container, Lifetime } from '@andrei-tatar/ts-ioc';

import { AppService } from './http/app.service';
import controllers from './http/controllers';
import { ExpressServerService } from './http/express.server.service';
import { FireBaseServerService } from './http/firebase.server.service';
import { DisconnectService } from './http/services/disconnect.service';
import { ExecuteService } from './http/services/execute.service';
import { FetchService } from './http/services/fetch.service';
import { QueryService } from './http/services/query.service';
import { SyncService } from './http/services/sync.service';
import { configFactory, ConfigService } from './services/config.service';
import { DevicesRepository } from "./services/devices.repository";
import { AdminFirebaseService } from './services/firebase.service';
import { JwtService } from './services/jwt.service';
import { LogService } from './services/log-service';
import { NoderedTokenService } from './services/nodered-token.service';
import { PostgresService } from './services/postgres.service';
import { ReportStateService } from './services/report-state.service';
import { RequestSyncService } from './services/request-sync.service';
import { UserRepositoryFactory, userRepositoryFactory } from './services/user.repository';
import { ValidationService } from './services/validation.service';
import { ConnectionHandler } from './socket/connectionhandler';
import { WebSocketService } from './socket/websocket.service';
import { UserRepositoryCloudStore } from './services/user.repository.cloudstore';
import { UserRepositoryPostgres } from './services/user.repository.postgres';

const container = new Container();

controllers.forEach(ctrl => container.register({
    token: ctrl,
    useClass: ctrl,
    lifetime: Lifetime.Request,
}));

container.register({ token: Container, useFactory: () => container });
container.register({ token: ConfigService, useFactory: configFactory });
container.register({ token: LogService, useClass: LogService });
container.register({ token: WebSocketService, useClass: WebSocketService });
container.register({ token: ExpressServerService, useClass: ExpressServerService });
container.register({ token: FireBaseServerService, useClass: FireBaseServerService });
container.register({ token: AppService, useClass: AppService });
container.register({ token: FetchService, useClass: FetchService });
container.register({ token: SyncService, useClass: SyncService, lifetime: Lifetime.Request });
container.register({ token: QueryService, useClass: QueryService, lifetime: Lifetime.Request });
container.register({ token: ExecuteService, useClass: ExecuteService, lifetime: Lifetime.Request });
container.register({ token: DisconnectService, useClass: DisconnectService, lifetime: Lifetime.Request });
container.register({ token: ConnectionHandler, useClass: ConnectionHandler, lifetime: Lifetime.Request });
container.register({ token: DevicesRepository, useClass: DevicesRepository, lifetime: Lifetime.Request });
container.register({ token: ReportStateService, useClass: ReportStateService, lifetime: Lifetime.Request });
container.register({ token: RequestSyncService, useClass: RequestSyncService, lifetime: Lifetime.Request });

container.register({ token: UserRepositoryCloudStore, useClass: UserRepositoryCloudStore });
container.register({ token: UserRepositoryPostgres, useClass: UserRepositoryPostgres });
container.register({ token: UserRepositoryFactory, useFactory: () => userRepositoryFactory(container) });
container.register({ token: NoderedTokenService, useClass: NoderedTokenService });
container.register({ token: JwtService, useClass: JwtService });
container.register({ token: PostgresService, useClass: PostgresService });
container.register({ token: AdminFirebaseService, useClass: AdminFirebaseService });
container.register({ token: ValidationService, useClass: ValidationService });

export { container };
