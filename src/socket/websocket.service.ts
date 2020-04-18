import { Server } from 'http';
import createSocketServer from 'socket.io';

import { Container, Inject } from '@andrei-tatar/ts-ioc';
import { Config } from '../config';
import { ConfigService } from '../services/config.service';
import { ConnectionHandler } from './connectionhandler';
import { registerBindedEvents } from './decorators/bindevent';
import { authenticationMiddleware } from './middlewares/authentication.middleware';
import { childContainerMiddleware } from './middlewares/childcontainer.middleware';
import { NoraSocket } from './nora-socket';
// import { oneConnectionPerUserMiddleware } from './middlewares/one-connection-per-user.middleware';

export class WebSocketService {
    constructor(@Inject(ConfigService) private config: Config, @Inject(Container) private container: Container) {}

    public register(server: Server) {
        const io = createSocketServer(server, {
            serveClient: false,
            pingInterval: 10000,
            pingTimeout: 5000,
        });
        io.use(childContainerMiddleware(this.container));
        io.use(authenticationMiddleware(this.config));
        // io.use(oneConnectionPerUserMiddleware(this.config));
        io.on('connect', (socket: NoraSocket) => {
            try {
                io.on('*', (event, data) => {
                    console.log('RecvMsg:', event, data);
                });
                const instance = socket.container.resolve(ConnectionHandler);
                registerBindedEvents(instance, socket);
            } catch (err) {
                console.warn(`unhandled error in socket connect`, err);
            }
        });
        return io;
    }
}
