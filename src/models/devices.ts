
import { FulfillPayload, FulfillResponse, Input, Intent } from '../google';
import { DevicesVisiter } from '../services/devices.visiter';
import { AllStates, Device, StateChanges } from './index';
// import { LogService } from '../services/log-service';

export class Devices {

    constructor(
        public readonly uid: string,
        private readonly visiter: DevicesVisiter,
    ) { }

    public async get(): Promise<Device[]> {
        return;
    }

    get isUserOnline(): boolean {
        return;
    }

    public async getDevice(id: string): Promise<Device> {
        return;
    }

    public getDevicesById(ids: string[]): Promise<Device[]> {
        return Promise.all(ids.map(id => this.getDevice(id)));
    }

    public async updateDevicesState(ids: string[],
        changes: Partial<AllStates> | ((device: Device) => Partial<AllStates>),
        { notifyClient = false, requestId, group }: {
        notifyClient?: boolean;
        requestId?: string;
        group?: string;
    } = {}) {
        const groupDevices = this.getDevicesInternal(group);
        const stateChanges: StateChanges = {};
        const notiyClientChanges: StateChanges = {};
        let anyChange = false;
        for (const id of ids) {
            const device = groupDevices[id];
            if (!device) {
                continue;
            }
            const deviceChanges = typeof changes === 'function' ? changes(device) : changes;
            this.visiter.log.info('updateDevicesState:', id, device, deviceChanges);
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
            DevicesRepository.statechanges.next({
                uid: this.uid,
                stateChanges: notiyClientChanges,
                hasChanges: anyChange,
            });
        }
    }



    public async activateScenes(deviceIds: string[], deactivate: boolean) {
        // this.devicesPipeline.commands.next({
        //     type: 'activate-scene',
        //     uid: this.uid,
        //     deviceIds,
        //     deactivate
        // });
    }

    public async processInputs(requestId: string, inputs: Input[]): Promise<FulfillResponse | {}> {
        let payload: FulfillPayload;
        for (const input of inputs) {
            this.visiter.log.info(`executing ${this.uid} ${input.intent} for ${requestId}`);
            switch (input.intent) {
                case Intent.Sync:
                    payload = await this.visiter.syncService.sync(this, requestId);
                    break;
                case Intent.Query:
                    payload = await this.visiter.queryService.query(this, input);
                    break;
                case Intent.Execute:
                    payload = await this.visiter.executeService.execute(this, input, requestId);
                    break;
                case Intent.Disconnect:
                    await this.visiter.disconnectService.disconnect(this.uid);
                    return {};
                default:
                    throw new Error('unsupported intent');
            }
        }
        const response: FulfillResponse = {
            requestId,
            payload,
        };

        return response;
    }
}