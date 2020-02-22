import { uniq } from 'lodash';

import { DeviceTypes, SyncDevice, SyncPayload, Traits } from '../../google';
import { Devices } from '../../models/devices';
import { ReportStateService } from '../../services/report-state.service';

export class SyncService {

    constructor(
        private reportStateService: ReportStateService,
    ) {
    }

    async sync(devices: Devices, requestId: string): Promise<SyncPayload> {
        // this.reportState(requestId, devices);
        const syncDevices = await this.devicesToSync(devices);
        return {
            agentUserId: devices.uid,
            devices: syncDevices,
        };
    }

    private async devicesToSync(devices: Devices) {
        return (await devices.get()).map(device => {
            // const device = devices[id];
            const sync: SyncDevice = {
                id: device.id,
                type: null,
                traits: [],
                name: {
                    name: device.name,
                    nicknames: device.nicknames,
                },
                roomHint: device.roomHint,
                willReportState: true,
            };
            switch (device.type) {
                case 'switch':
                    sync.type = DeviceTypes.Switch;
                    sync.traits.push(Traits.OnOff);
                    break;
                case 'outlet':
                    sync.type = DeviceTypes.Outlet;
                    sync.traits.push(Traits.OnOff);
                    break;
                case 'light':
                    sync.type = DeviceTypes.Light;
                    sync.traits.push(Traits.OnOff);
                    if (device.brightnessControl) {
                        sync.traits.push(Traits.Brightness);
                    }
                    if (device.colorControl) {
                        sync.traits.push(Traits.ColorSetting);
                        sync.attributes = { colorModel: 'hsv' };
                    }
                    break;
                case 'scene':
                    sync.type = DeviceTypes.Scene;
                    sync.traits.push(Traits.Scene);
                    sync.willReportState = false;
                    sync.attributes = {
                        sceneReversible: device.sceneReversible,
                    };
                    break;
                case 'thermostat':
                    sync.type = DeviceTypes.Thermostat;
                    sync.traits.push(Traits.TemperatureSetting);
                    sync.attributes = {
                        availableThermostatModes: uniq(device.availableModes).join(','),
                        thermostatTemperatureUnit: device.temperatureUnit,
                        bufferRangeCelsius: device.bufferRangeCelsius,
                        commandOnlyTemperatureSetting: device.commandOnlyTemperatureSetting,
                        queryOnlyTemperatureSetting: device.queryOnlyTemperatureSetting,
                    };
                    break;
                case 'speaker':
                    sync.type = DeviceTypes.Speaker;
                    sync.traits.push(Traits.OnOff, Traits.Volume);
                    break;
                case 'blinds':
                    sync.type = DeviceTypes.Blinds;
                    sync.traits.push(Traits.OpenClose);
                    break;
                case 'garage':
                    sync.type = DeviceTypes.Garage;
                    sync.traits.push(Traits.OpenClose);
                    break;
                case 'lock':
                    sync.type = DeviceTypes.Lock;
                    sync.traits.push(Traits.LockUnlock);
                    break;
            }
            return sync;
        });
    }

    // private async reportState(uid: string, requestId: string, devices: Devices) {
    //     const stateChanges: StateChanges = {};
    //     const ids = Object.keys(devices);
    //     for (const id of ids) {
    //         stateChanges[id] = devices[id].state;
    //     }
    //     if (ids.length) {
    //         try {
    //             await delay(3000);
    //             await this.reportStateService.reportState(stateChanges, requestId);
    //         } catch (err) {
    //             console.warn(`reportState failed (uid: ${uid})`, err);
    //         }
    //     }
    // }
}
