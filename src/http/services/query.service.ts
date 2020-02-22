import { QueryDevice, QueryDevices, QueryInput, QueryPayload } from '../../google';
import { Device } from '../../models';
import { Devices } from '../../models/devices';

export class QueryService {

    constructor() { }

    public async query(devices: Devices, input: QueryInput): Promise<QueryPayload> {
        const queryIds = input.payload.devices.map(d => d.id);
        const userDevices = await devices.getDevicesById(queryIds);
        const queryDevices: QueryDevices = {};
        userDevices.forEach((device, index) => {
            const id = queryIds[index];
            if (!device) {
                queryDevices[id] = { online: false };
            } else {
                const state: QueryDevice = {
                    online: device.state.online,
                };
                this.updateQueryState(state, device);
                devices[id] = state;
            }
        });
        return { devices: queryDevices };
    }

    private updateQueryState(state: QueryDevice, device: Device) {
        switch (device.type) {
            case 'outlet':
            case 'switch':
                state.on = device.state.on;
                break;
            case 'light':
                state.on = device.state.on;
                if (device.brightnessControl) {
                    state.brightness = device.state.brightness || 100;
                }
                if (device.colorControl) {
                    state.color = device.state.color;
                }
                break;
            case 'thermostat':
                state.thermostatMode = device.state.thermostatMode;
                state.thermostatTemperatureAmbient = device.state.thermostatTemperatureAmbient;
                state.thermostatHumidityAmbient = device.state.thermostatHumidityAmbient;
                if (device.state.thermostatMode === 'heatcool') {
                    state.thermostatTemperatureSetpointHigh = device.state.thermostatTemperatureSetpointHigh;
                    state.thermostatTemperatureSetpointLow = device.state.thermostatTemperatureSetpointLow;
                } else {
                    state.thermostatTemperatureSetpoint = device.state.thermostatTemperatureSetpoint;
                }
                break;
            case 'speaker':
                state.on = device.state.on;
                state.currentVolume = device.state.currentVolume;
                state.isMuted = device.state.isMuted;
                break;
            case 'blinds':
            case 'garage':
                state.openPercent = device.state.openPercent;
                break;
            case 'lock':
                state.isLocked = device.state.isLocked;
                state.isJammed = device.state.isJammed;
                break;
        }
    }
}
