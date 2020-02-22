import { cloneDeep, isEqual, Omit } from 'lodash';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { Inject } from '@andrei-tatar/ts-ioc';
import { AllStates, Device } from '../models';
import { DevicesPerUserStore } from './devices.per.user.store';
import { Command, DevicesPipeline, MsgStateChanges } from './devices.pipeline';
import { LogService } from './log-service';
import { OnlineUsersStore } from './online.users.store';
import { ReportStateService } from './report-state.service';
import { RequestSyncService } from './request-sync.service';

export class DevicesPerUser {

    readonly commands$: Observable<Omit<Command, 'uid'>>;
    readonly stateChanges$: Observable<MsgStateChanges>;

    constructor(
        @Inject('uid') private uid: string,
        @Inject(LogService) private log: LogService,
        @Inject(ReportStateService) private reportStateService: ReportStateService,
        @Inject(RequestSyncService) private requestSyncService: RequestSyncService,
        @Inject(DevicesPipeline) private devicesPipeline: DevicesPipeline,
        @Inject(DevicesPerUserStore) private devicesPerUserStore: DevicesPerUserStore,
        @Inject(OnlineUsersStore) private onlineUsersStore: OnlineUsersStore,
    ) {
        this.commands$ = this.devicesPipeline.commands.pipe(filter(c => c.uid === this.uid), map(c => c as Omit<Command, 'uid'>));
        this.stateChanges$ = this.devicesPipeline.statechanges.pipe(filter(c => c.uid === this.uid));
    }

    async sync(devices: Devices, group: string) {
        const oldDevices = this.devicesPerUserStore.getDevicesInternal(group);

        const existingDevices = this.getSyncCompareDevices(oldDevices);
        const newDevices = this.getSyncCompareDevices(devices);

        this.devicesPerUserStore.setDevices(this.uid, group, cloneDeep(devices));


        if (!isEqual(existingDevices, newDevices)) {
            try {
                await this.requestSyncService.requestSync();
            } catch (err) {
                console.warn(`requestSync failed, trying again in 10 sec`, err);
                await new Promise(r => setTimeout(r, 10000));
                this.requestSyncService.requestSync().catch(err => {
                    console.warn(`requestSync try 2 failed`, err);
                });
            }
        }
    }

    userOnline(group: string, version: string = 'unknown') {
        return new Observable<void>(() => {
            this.onlineUsersStore.setVersion(this.uid, group, version);

            return () => {
                this.onlineUsersStore.deleteVersion(this.uid, group);
                const devices = this.devicesPerUserStore.getDevicesInternal(this.uid, group);
                this.updateDevicesState(devices, { online: false }, { group });
            };
        });
    }

    activateScenes(deviceIds: string[], deactivate: boolean) {
        this.devicesPipeline.commands.next({
            type: 'activate-scene',
            uid: this.uid,
            deviceIds,
            deactivate
        });
    }

    updateDevicesState(
        groupDevices: Devices,
        changes: Partial<AllStates> | ((device: Device) => Partial<AllStates>),
        { notifyClient = false, requestId, group }: { notifyClient?: boolean, requestId?: string, group?: string } = {}
    ) {
        // const stateChanges: StateChanges = {};
        // const notiyClientChanges: StateChanges = {};
        let anyChange = false;
        for (const id of ids) {
            const device = groupDevices[id];
            if (!device) { continue; }

            const deviceChanges = typeof changes === 'function' ? changes(device) : changes;
            this.log.info('updateDevicesState:', id, device, deviceChanges);
            for (const key of Object.keys(deviceChanges)) {
                const newValue = deviceChanges[key];
                device.state[key] = newValue;
            }
            stateChanges[id] = device.state;
            anyChange = true;
            notiyClientChanges[id] = device.state;
        }

        if (anyChange) {
            this.reportStateService.reportState(stateChanges, requestId).catch(err => {
                console.warn('err while reporting state', err);
            });
        }

        if (notifyClient) {
            this.devicesPipeline.statechanges.next({
                uid: this.uid,
                stateChanges: notiyClientChanges,
                hasChanges: anyChange,
            });
        }
    }

    private getSyncCompareDevices(devices: Devices) {
        const forCompare: Devices = new Map<string, Device>();
        for (const id of devices.keys) {
            forCompare[id] = { ...devices[id], state: null };
        }
        return forCompare;
    }
}
