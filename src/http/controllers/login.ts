import { Inject, Lazy } from '@andrei-tatar/ts-ioc';

import { AdminFirebaseService } from '../../services/firebase.service';
import { JwtService } from '../../services/jwt.service';
import { LogService } from '../../services/log-service';
import { NoderedTokenService } from '../../services/nodered-token.service';
import { UserRepository, UserRepositoryFactory } from '../../services/user.repository';
import { Http } from '../decorators/http';
import { Param } from '../decorators/param';
import { Controller } from './controller';

@Http.controller('/login')
export class LoginController extends Controller {
    constructor(
        @Inject(UserRepositoryFactory) private userRepository: Lazy<UserRepository>,
        @Inject(JwtService) private jwtService: Lazy<JwtService>,
        @Inject(AdminFirebaseService) private firebase: Lazy<AdminFirebaseService>,
        @Inject(NoderedTokenService) private nrtokenService: Lazy<NoderedTokenService>,
        @Inject(LogService) private log: LogService,
    ) {
        super();
    }

    @Http.get('/init.js')
    async getInitJs() {
        const templateInitJs = function(firebase: any, fbConfig: any) {
            if (typeof firebase === 'undefined') {
                throw new Error('hosting/init-error: Firebase SDK not detected. You must include it before /__/firebase/init.js');
            }
            firebase.initializeApp(fbConfig);
        };
        return {
            contentType: 'text/javascript; charset=utf-8',
            body: `(${templateInitJs.toString()})(firebase, ${JSON.stringify(this.config.fireBase.val, null, 2)});`,
        };
    }

    @Http.get()
    async getLoginTemplate(
        @Param.queryString() query: string,
    ) {
        return await this.renderTemplate('login', {
            query: query ? '?' + query : '',
            appTitle: this.config.appTitle.val,
            loginUrl: this.absUrl('/login'),
            termsUrl: this.absUrl('/terms'),
            privacyUrl: this.absUrl('/privacy'),
            fireBase: this.config.fireBase.val
        });
    }

    @Http.post()
    async doLogin(
        @Param.fromBody('token') firebaseToken: string,
        // @Param.fromQuery('redirect') redirect: string,
        @Param.queryString() query: string,
    ) {
        // await delay(500);
        try {
            const decoded = await this.firebase.value.verifyToken(firebaseToken);
            this.response.cookie('IDToken', firebaseToken, {
                secure: this.config.secureCookie.val,
            });
            await this.userRepository.value.createUserRecordIfNotExists(decoded.uid);

            // Here we generate a long living token which works outside
            // of firebase but the way of how google wants to use there api's
            // it needs a private key on the serverside
            if (this.config.serviceAccount.private_key.val) {
                const token: UserToken = {
                    uid: decoded.uid,
                    exp: Math.round((new Date().getTime() + 3600000) / 1000),
                    scope: 'app-user',
                    nodered: await this.nrtokenService.value.generateToken(decoded.uid, this.config.serviceAccount.private_key.val),
                };

                const tokenStr = await this.jwtService.value.sign(token, this.config.serviceAccount.private_key.val);
                this.response.cookie(this.config.jwtCookieName.val, tokenStr, {
                    secure: this.config.secureCookie.val,
                });
            }
            // open Redirect Security on question
            // if (typeof redirect === 'string') {
            //     const redirectUri = Buffer.from(redirect, 'base64').toString();
            //     return this.redirect(redirectUri);
            // }
            return this.redirect('/');
        } catch (err) {
            this.log.error('login: ', err);
            return this.redirect(`/login${query ? '?' + query : ''}`);
        }
    }
}

export interface UserToken {
    uid: string;
    exp: number;
    scope: string;
    nodered?: string;
}
