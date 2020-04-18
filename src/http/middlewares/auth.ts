import { NextFunction, Request, Response } from 'express';

import { Container } from '@andrei-tatar/ts-ioc';
import { Config } from '../../config';
import { JwtService } from '../../services/jwt.service';
import { UserToken } from '../controllers/login';
import { NotAuthorizedError } from './exception';

// declare module 'express' {
//     export interface Request {
//         token?: UserToken;
//     }
// }

// declare module 'socket.io' {
//     export interface Socket {
//         uid: string;
//         req: IncomingMessage;
//     }
// }

export function authMiddleware(config: Config, container: Container) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            let authToken = req.cookies[config.jwtCookieName.val];
            if (!authToken) {
                const authHeader = req.header('Authorization');
                if (authHeader) {
                    const parts = authHeader.split(' ');
                    if (parts.length === 2 && parts[0] === 'Bearer') {
                        authToken = parts[1];
                    }
                }
            }

            if (authToken) {
                const jwt = container.resolve(JwtService);
                const token = await jwt.verify<UserToken>(authToken, config.serviceAccount.private_key.val);
                res.locals.token = token;
            }
        } catch (err) {
        }
        next();
    };
}

export function authFilter({ scope, uid, redirectToLogin = false }: { scope?: string, uid?: string, redirectToLogin?: boolean } = {}) {
    return () => (req: Request, res: Response, next: NextFunction) => {
        if (!res.locals.token ||
            scope && res.locals.token.scope !== scope ||
            uid !== void 0 && res.locals.token.uid !== uid) {
            if (redirectToLogin) {
                const redirect = Buffer.from(req.originalUrl).toString('base64');
                return res.redirect('/login?redirect=' + redirect);
            } else {
                throw new NotAuthorizedError('user not allowed: ' + JSON.stringify(res.locals.token || {}));
            }
        }
        next();
    };
}

