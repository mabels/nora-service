import { Device, Devices } from '../models';

export class DevicesPerUserStore {
    private devicesPerUser = new Map<string/*uid*/, Map<string/*group*/, Devices>>();

    public setDevices(uid: string, grp: string, devices: Devices) {
        let userGroups = this.devicesPerUser[uid];
        if (!userGroups) {
            this.devicesPerUser[uid] = userGroups = new Map<string, Devices>();
        }
        userGroups[grp] = devices;
    }

    getAllDevices(uid: string) {
        return this.getDevicesInternal(uid);
    }

    getDevice(uid: string, id: string) {
        return this.getAllDevices(uid).get(id);
    }

    getDeviceIdsInGroup(uid: string, group: string) {
        const userDevices = this.devicesPerUser.get(uid);
        if (userDevices) {
            const groupDevices = userDevices.get(group);
            if (groupDevices) {
                return groupDevices.keys;
            }
        }
        return (new Map<string, Devices>()).keys;
    }

    public getDevicesInternal(uid: string, group?: string): Devices {
        const userDevices = this.devicesPerUser.get(uid) || new Map<string, Devices>();
        if (group) {
            return userDevices.get(group);
        } else {
            const allDevices: Devices = new Map<string, Device>();
            for (const groupName of Object.keys(userDevices)) {
                const groupDevices = userDevices[groupName];
                for (const deviceId of Object.keys(groupDevices)) {
                    allDevices[deviceId] = groupDevices[deviceId];
                }
            }
            return allDevices;
        }
    }

}
