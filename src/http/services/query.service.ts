import { Inject } from '@andrei-tatar/ts-ioc';
import { QueryDevice, QueryDevices, QueryInput, QueryPayload } from '../../google';
import { Device } from '../../models';
import { isLightWithBrightness, isLightWithColorControlTemperature, isLightWithColorHSV, isLightWithColorRGB } from '../../models/light';
import { DevicesRepository } from '../../services/devices.repository';
import { ColorHue } from '../../models/states/color';

export class QueryService {
    constructor(
        @Inject(DevicesRepository)
        private devices: DevicesRepository,
    ) {}

    query(input: QueryInput): QueryPayload {
        const queryIds = input.payload.devices.map((d) => d.id);
        const userDevices = this.devices.getDevicesById(queryIds);
        const devices: QueryDevices = {};
        for (const [index, device] of userDevices.entries()) {
            const id = queryIds[index];
            if (!device) {
                devices[id] = { online: false };
            } else {
                const state: QueryDevice = {
                    online: device.state.online,
                };
                this.updateQueryState(state, device);
                devices[id] = state;
            }
        }
        return { devices };
    }

    private updateQueryState(state: QueryDevice, device: Device) {
        switch (device.type) {
            case 'outlet':
            case 'switch':
                state.on = device.state.on;
                break;
            case 'light':
                state.on = device.state.on;
                if (isLightWithBrightness(device)) {
                    state.brightness = device.state.brightness || 100;
                }
                if (isLightWithColorHSV(device)) {
                    let cl: ColorHue;
                    if (device.state.color.spectrumHsv) {
                        cl = {
                            ...device.state.color.spectrumHsv
                        };
                    }
                    if (device.state.color.HSV) {
                        cl = {
                            hue: device.state.color.HSV.h,
                            saturation: device.state.color.HSV.s,
                            value: device.state.color.HSV.v,
                        };
                    }

                    state.color = {
                        ...state.color,
                        spectrumHSV: cl
                    };
                }
                if (isLightWithColorRGB(device)) {
                    state.color = {
                        ...state.color,
                        spectrumRGB: {
                            red: device.state.color.RGB.r,
                            green: device.state.color.RGB.g,
                            blue: device.state.color.RGB.b,
                        },
                    };
                }
                if (isLightWithColorControlTemperature(device)) {
                    state.color = { ...state.color, temperatureK: device.state.color.temperatureK };
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
