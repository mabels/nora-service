import { uniq } from 'lodash';

import {
  ExecuteCommandTypes, ExecuteInput, ExecutePayload,
  ExecuteStatus
} from '../../google';
import { CommandExecution, ExecutePayloadCommand } from '../../google/execute';
import { Devices } from '../../models/devices';

interface ResponseState {
  offlineDeviceIds: string[];
  successDeviceIds: string[];
  needAckDeviceIds: string[];
  needPinDeviceIds: string[];
  wrongPinDeviceIds: string[];
}

export class ExecuteService {

  constructor() { }

  public async execute(devices: Devices, input: ExecuteInput, requestId?: string): Promise<ExecutePayload> {
    const state: ResponseState = {
      offlineDeviceIds: [],
      successDeviceIds: [],
      needAckDeviceIds: [],
      needPinDeviceIds: [],
      wrongPinDeviceIds: [],
    };
    const updateOptions = { requestId, notifyClient: true };
    for (const command of input.payload.commands) {
      for (const execution of command.execution) {
        let deviceIds = command.devices.map(d => d.id);

        if (!devices.isUserOnline) {
          state.offlineDeviceIds.push(...deviceIds);
          continue;
        }

        deviceIds = (await this.filterDevices(devices, execution, deviceIds, state)).map(d => d.id);

        switch (execution.command) {
          case ExecuteCommandTypes.Brightness:
          case ExecuteCommandTypes.OnOff:
          case ExecuteCommandTypes.ThermostatTemperatureSetpoint:
          case ExecuteCommandTypes.ThermostatTemperatureSetRange:
          case ExecuteCommandTypes.ThermostatSetMode:
          case ExecuteCommandTypes.OpenClose:
            devices.updateDevicesState(deviceIds, execution.params, updateOptions);
            break;
          case ExecuteCommandTypes.ColorAbsolute:
            if (execution.params.color.spectrumHSV) {
              devices.updateDevicesState(deviceIds, {
                color: {
                  spectrumHsv: execution.params.color.spectrumHSV,
                }
              }, updateOptions);
            }
            break;
          case ExecuteCommandTypes.LockUnlock:
            devices.updateDevicesState(deviceIds, {
              isLocked: execution.params.lock,
            }, updateOptions);
            break;
          case ExecuteCommandTypes.ActivateScene:
            const deactivate: boolean = typeof execution.params.deactivate === 'boolean' ? execution.params.deactivate : false;
            await devices.activateScenes(deviceIds, deactivate);
            break;
          case ExecuteCommandTypes.SetVolume:
            devices.updateDevicesState(deviceIds, { currentVolume: execution.params.volumeLevel }, updateOptions);
            break;
          case ExecuteCommandTypes.TemperatureRelative:
            devices.updateDevicesState(deviceIds, device => {
              if (device.type === 'thermostat') {
                const { thermostatTemperatureRelativeDegree, thermostatTemperatureRelativeWeight } = execution.params;
                const change = thermostatTemperatureRelativeDegree || (thermostatTemperatureRelativeWeight / 2);
                return {
                  thermostatTemperatureSetpoint: device.state + change,
                };
              }
              return {};
            }, updateOptions);
            break;
          case ExecuteCommandTypes.VolumeRelative:
            devices.updateDevicesState(deviceIds, device => {
              if (device.type === 'speaker' && 'currentVolume' in device.state) {
                const relativeStepSize = device.relativeVolumeStep || execution.params.volumeRelativeLevel;
                const delta = execution.params.relativeSteps * relativeStepSize;
                const newVolume = Math.min(100, Math.max(0, device.state.currentVolume + delta));
                return { currentVolume: newVolume };
              }
              return {};
            }, updateOptions);
            break;
          default:
            console.warn(`unsupported execution command: ${execution.command}`);
            break;
        }

        state.successDeviceIds.push(...deviceIds);
        break;
      }
    }

    const payload: ExecutePayload = { commands: [] };
    this.addResponseCommand(payload, state.successDeviceIds, ExecuteStatus.success);
    this.addResponseCommand(payload, state.offlineDeviceIds, ExecuteStatus.offline);
    this.addResponseCommand(payload, state.needAckDeviceIds, ExecuteStatus.error, c => {
      c.errorCode = 'challengeNeeded';
      c.challengeNeeded = { type: 'ackNeeded' };
    });
    this.addResponseCommand(payload, state.needPinDeviceIds, ExecuteStatus.error, c => {
      c.errorCode = 'challengeNeeded';
      c.challengeNeeded = { type: 'pinNeeded' };
    });
    this.addResponseCommand(payload, state.wrongPinDeviceIds, ExecuteStatus.error, c => {
      c.errorCode = 'challengeNeeded';
      c.challengeNeeded = { type: 'challengeFailedPinNeeded' };
    });

    return payload;
  }

  private addResponseCommand(
    payload: ExecutePayload, ids: string[], status: ExecuteStatus,
    customize?: (command: ExecutePayloadCommand) => void
  ) {
    if (ids.length) {
      const command: ExecutePayloadCommand = {
        ids: uniq(ids),
        status,
      };
      if (customize) { customize(command); }
      payload.commands.push(command);
    }
  }

  private async filterDevices(devices: Devices, execution: CommandExecution, deviceIds: string[], state: ResponseState) {
    return (await Promise.all(deviceIds
      .map(deviceId => devices.getDevice(deviceId))))
      .filter(device => {
      if (!device || !device.state.online) {
        state.offlineDeviceIds.push(device.id);
        return false;
      }

      if ('twoFactor' in device) {
        switch (device.twoFactor) {
          case 'ack':
            if (!execution.challenge || !execution.challenge.ack) {
              state.needAckDeviceIds.push(device.id);
              return false;
            }
            break;
          case 'pin':
            if (!execution.challenge || !execution.challenge.pin) {
              state.needPinDeviceIds.push(device.id);
              return false;
            }

            if (execution.challenge.pin !== device.pin) {
              state.wrongPinDeviceIds.push(device.id);
              return false;
            }
            break;
        }
      }

      return true;
    });
  }
}
