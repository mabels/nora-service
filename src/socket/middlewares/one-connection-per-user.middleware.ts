import { Socket } from 'socket.io';
import { Config } from '../../services/config';

export function oneConnectionPerUserMiddleware(config: Config) {
    const connectedUsers: {
        [userId: string]: {
            [group: string]: boolean;
        };
    } = {};

    return (socket: Socket, next: (err?: any) => void) => {
        try {
            const userId = socket.uid;
            const group = socket.handshake.query.group || '';

            let userConnections = connectedUsers[userId];
            if (!userConnections) {
                userConnections = connectedUsers[userId] = {};
            }

            if (Object.keys(userConnections).length >= 3 && userId !== config.userAdminUid) {
                throw new Error('too many active connections');
            }
            if (userConnections[group]) {
                throw new Error('user already connected');
            }

            userConnections[group] = true;
            socket.once('disconnect', () => delete userConnections[group]);
            next();
        } catch (err) {
            next(err);
        }
    };
}
