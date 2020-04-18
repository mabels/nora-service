import { Container } from '@andrei-tatar/ts-ioc';
import { NextFunction, Request, Response } from 'express';


// declare module 'express' {
//     export interface Request {
//         container: Container;
//     }
// }

export function containerMiddleware(container: Container) {
    return (req: Request, res: Response, next: NextFunction) => {
        res.locals.container = container.createChild();
        res.locals.container.register({ token: 'request', useValue: req });
        res.locals.container.register({ token: 'response', useValue: res });
        res.locals.container.register({ token: 'uid', useFactory: () => res.locals.token.uid });
        next();
    };
}

export function destroyContainerMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            res.locals.container.destroy();
            delete res.locals.container;
        } catch {
        }
        next();
    };
}
