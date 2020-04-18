import { Container } from '@andrei-tatar/ts-ioc';
import { Socket } from 'socket.io';

export interface NoraSocket extends Socket {
    uid: string;
    container: Container;
}
