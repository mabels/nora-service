import { Devices } from '../models/devices';
import { DevicesFromUidMemory } from './devices.from.uid.memory';

export interface DevicesFromUid {
    get(uid: string): Promise<Devices>;
}

export function DevicesFromUidFactory(): DevicesFromUid {
    // return new DevicesFromUidMemory();
    return;
}
