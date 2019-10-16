import { Container, Lifetime } from '@andrei-tatar/ts-ioc';
import controllers from './http/controllers';
import { DisconnectService } from './http/services/disconnect.service';
import { ExecuteService } from './http/services/execute.service';
import { QueryService } from './http/services/query.service';
import { SyncService } from './http/services/sync.service';
import { CloudstoreService } from './services/cloudstore.service';
import { ConfigEnvService } from './services/config.env.service';
import { ConfigFireBaseService } from './services/config.firebase.service';
import { ConfigLocalService } from './services/config.local.service';
import { DevicesRepository } from './services/devices.repository';
import { factoryConfigService } from './services/factory.config.service';
import { FirebaseService } from './services/firebase.service';
import { JwtService } from './services/jwt.service';
import { MainService } from './services/main.service';
import { NodePersistService } from './services/node-persist.service';
import { NoderedTokenService } from './services/nodered-token.service';
import { PostgressService } from './services/postgress.service';
import { ReportStateService } from './services/report-state.service';
import { RequestSyncService } from './services/request-sync.service';
import { UserRepository } from './services/user.repository';
import { ValidationService } from './services/validation.service';
import { ConnectionHandler } from './socket/connectionhandler';

const container = new Container();

controllers.forEach(ctrl => container.register({
    token: ctrl,
    useClass: ctrl,
    lifetime: Lifetime.Request,
}));

container.register({ token: ConfigLocalService, useClass: ConfigLocalService });
container.register({ token: ConfigEnvService, useClass: ConfigEnvService });
container.register({ token: ConfigFireBaseService, useClass: ConfigFireBaseService });

container.register({ token: 'ConfigService', useFactory: factoryConfigService(container) });

container.register({ token: SyncService, useClass: SyncService, lifetime: Lifetime.Request });
container.register({ token: QueryService, useClass: QueryService, lifetime: Lifetime.Request });
container.register({ token: ExecuteService, useClass: ExecuteService, lifetime: Lifetime.Request });
container.register({ token: DisconnectService, useClass: DisconnectService, lifetime: Lifetime.Request });
container.register({ token: ConnectionHandler, useClass: ConnectionHandler, lifetime: Lifetime.Request });
container.register({ token: DevicesRepository, useClass: DevicesRepository, lifetime: Lifetime.Request });
container.register({ token: ReportStateService, useClass: ReportStateService, lifetime: Lifetime.Request });
container.register({ token: RequestSyncService, useClass: RequestSyncService, lifetime: Lifetime.Request });

container.register({ token: PostgressService, useClass: PostgressService });
container.register({ token: CloudstoreService, useClass: CloudstoreService });
container.register({ token: NodePersistService, useClass: NodePersistService });

container.register({ token: UserRepository, useClass: UserRepository });
container.register({ token: JwtService, useClass: JwtService });
container.register({ token: NoderedTokenService, useClass: NoderedTokenService });

container.register({ token: FirebaseService, useClass: FirebaseService });
container.register({ token: ValidationService, useClass: ValidationService });

container.register({ token: MainService, useClass: MainService });

export { container };
