import { Inject } from '@andrei-tatar/ts-ioc';

import { Config } from '../../config';
import { ConfigService } from '../../services/config.service';
import { DevicesRepository } from "../../services/devices.repository";
import { Http } from '../decorators/http';
import { Param } from '../decorators/param';
import { authFilter } from '../middlewares/auth';
import { Controller } from './controller';

@Http.controller('/admin')
export class AdminController extends Controller {

    constructor(
        @Inject(DevicesRepository)
        private devices: DevicesRepository,
        @Inject(ConfigService) config: Config
    ) {
        super();
        Http.filter(authFilter({ scope: 'app-user', uid: config.userAdminUid.val, redirectToLogin: true }));
    }

    @Http.get()
    get(
        @Param.fromQuery('uid') uid?: string,
    ) {
        return {

            onlineUsers: uid
                ? this.devices.onlineUsers[uid]
                : this.devices.onlineUsers,

            devices: uid
                ? this.devices.allDevices[uid]
                : this.devices.allDevices,
        };
    }
}
