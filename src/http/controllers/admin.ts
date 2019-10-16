import { DevicesRepository } from '../../services/devices.repository';
import { Http } from '../decorators/http';
import { Param } from '../decorators/param';
import { authFilter } from '../middlewares/auth';
import { Controller } from './controller';

@Http.controller('/admin')
@Http.filter(authFilter({ redirectToLogin: true }))
export class AdminController extends Controller {

    constructor(
        private devices: DevicesRepository,
    ) {
        super();
        // tslint:disable-next-line:no-debugger
        debugger;
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
