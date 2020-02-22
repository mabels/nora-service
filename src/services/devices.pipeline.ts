import { Subject } from 'rxjs';

import { StateChanges } from '../models';

export interface ActivateSceneCommand {
    readonly type: 'activate-scene';
    readonly uid: string;
    readonly deviceIds: string[];
    readonly deactivate: boolean;
}

export type Command = ActivateSceneCommand;

export interface MsgStateChanges {
    readonly uid: string;
    readonly stateChanges: StateChanges;
    readonly hasChanges: boolean;
}

export class DevicesPipeline {
    public readonly commands = new Subject<Command>();
    public readonly statechanges = new Subject<MsgStateChanges>();
}
