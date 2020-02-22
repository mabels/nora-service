import { Inject } from '@andrei-tatar/ts-ioc';

import { Devices } from '../models/devices';
import { DevicesFromUid } from './devices.from.uid';
import { DevicesVisiter } from './devices.visiter';

export class DevicesFromUidMemory implements DevicesFromUid {
    private readonly store = new Map<string, Devices>();

    constructor(@Inject(DevicesVisiter) private readonly devicesVisiter: DevicesVisiter) {}

    public async get(uid: string): Promise<Devices> {
        let devices = this.store.get(uid);
        if (!devices) {
            devices = new Devices(uid, this.devicesVisiter);
            this.store.set(uid, devices);
        }
        return devices;
    }
}
