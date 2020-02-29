import { IncomingMessage } from 'http';
import { Socket } from 'socket.io';
import { Config } from '../../config';
import { NoderedTokenService } from '../../services/nodered-token.service';

export function authenticationMiddleware(config: Config) {
    return async (socket: Socket, next: (err?: any) => void) => {
        try {

            socket.req = socket.request;
            const authToken = socket.handshake.query.token;
            if (!authToken || !authToken.length) {
                throw new Error('not authorized');
            }

            const tokenService = socket.container.resolve(NoderedTokenService);
            socket.uid = await tokenService.validateToken(authToken, config.serviceAccount.private_key.val);
            next();
        } catch (err) {
            next(new Error('not authorized'));
        }
    };
}

declare module 'socket.io' {
    export interface Socket {
        uid: string;
        req: IncomingMessage;
    }
}
