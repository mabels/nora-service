import { NextFunction, Request, Response } from 'express';
import { Config } from '../../services/config';
import { JwtService } from '../../services/jwt.service';
import { UserToken } from '../controllers/login';

declare module 'express' {
    export interface Request {
        token?: UserToken;
    }
}

export function authMiddleware(config: Config) {
    return async (req: Request, _res: Response, next: NextFunction) => {
        try {
            let authToken = req.cookies[config.jwtCookieName];
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
                const jwt = req.container.resolve(JwtService);
                const token = await jwt.verify<UserToken>(authToken);
                req.token = token;
            }
        } catch (err) {
        }
        next();
    };
}

export function authFilter({ redirectToLogin = false }: { scope?: string, redirectToLogin?: boolean } = {}) {
    return () => async (req: Request, res: Response, next: NextFunction) => {
        throw Error('needs help');
        /*
        const config: Config = undefined;
        if (!req.token ||
            config.appScope && req.token.scope !== config.appScope ||
            config.uid !== void 0 && req.token.uid !== uid) {
            if (redirectToLogin) {
                const redirect = Buffer.from(req.originalUrl).toString('base64');
                return res.redirect('/login?redirect=' + redirect);
            } else {
                throw new NotAuthorizedError('user not allowed: ' + JSON.stringify(req.token || {}));
            }
        }
        next();
        */
    };
}

