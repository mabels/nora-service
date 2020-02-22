import { Observable } from 'rxjs';

import { Inject } from '@andrei-tatar/ts-ioc';
import { DevicesPerUserStore } from './devices.per.user.store';

export class OnlineUsersStore {
    private onlineUsers = new Map<string, Map<string, string>>();

    constructor(
        @Inject(DevicesPerUserStore) private devicePerUserStore: DevicesPerUserStore
    ) {}

    public isUserOnline(uid: string) {
        return this.onlineUsers.has(uid);
    }

    public setVersion(uid: string, grp: string, version: string) {
        let byUser = this.onlineUsers.get(uid);
        if (!byUser) {
            byUser = new Map<string, string>();
            this.onlineUsers.set(uid, byUser);
        }
        byUser.set(grp, version);
    }

    public deleteVersion(uid: string, grp: string) {
        const byUser = this.onlineUsers.get(uid);
        if (byUser) {
            byUser.delete(grp);
            if (byUser.size === 0) {
                this.onlineUsers.delete(uid);
            }
        }
    }

    userOnline(uid: string, group: string, version: string = 'unknown') {
        return new Observable<void>(() => {
            let onlineGroups = this.onlineUsers.get(uid);
            if (!onlineGroups) {
                onlineGroups = new Map();
                this.onlineUsers.set(uid, onlineGroups);
            }
            onlineGroups.set(group, version);
            return () => {
                onlineGroups.delete(group);
                if (onlineGroups.size === 0) {
                    this.onlineUsers.delete(uid);
                }
                const deviceIds = this.devicePerUserStore.getDevicesInternal(group).keys;
                this.devicePerUserStore.updateDevicesState(deviceIds, { online: false }, { group });
            };
        });
    }

}
