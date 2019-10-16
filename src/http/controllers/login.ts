import { Inject, Lazy } from '@andrei-tatar/ts-ioc';
// import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as config from '../../config';
import { FirebaseService } from '../../services/firebase.service';
import { JwtService } from '../../services/jwt.service';
import { NoderedTokenService } from '../../services/nodered-token.service';
import { UserRepository } from '../../services/user.repository';
// import { delay } from '../../util';
import { Http } from '../decorators/http';
import { Param } from '../decorators/param';
import { Controller } from './controller';

@Http.controller('/login')
export class LoginController extends Controller {

    constructor(
        @Inject('UserRepository')
        private userRepository: Lazy<UserRepository>,
        @Inject(JwtService)
        private jwtService: Lazy<JwtService>,
        @Inject(FirebaseService)
        private firebase: Lazy<FirebaseService>,
        @Inject(NoderedTokenService)
        private nrtokenService: Lazy<NoderedTokenService>,

    ) {
        super();
    }

    @Http.get()
    async getLoginTemplate(
        @Param.queryString() query: string,
    ) {
        const fbConfig = functions.config();
        // console.log(`WTF:`, fbConfig, config);
        return await this.renderTemplate('login', {
            loginFormUrl: `${this.redirectUrl('/login')}${query ? '?' + query : ''}`,
            authClientConfig:
                typeof config.authClientConfig === 'object' ?
                JSON.stringify(config.authClientConfig) :
                'undefined',
            scriptFireBaseInitJs:
                (typeof fbConfig.nora_service === 'object' &&
                 typeof fbConfig.nora_service.firebase_init_js_url === 'string') ?
                 `<script src="${fbConfig.nora_service.firebase_init_js_url}"></script>`
                 :
                 '',
        });
    }

    @Http.post()
    async doLogin(
        @Param.fromBody('token') firebaseToken: string,
        @Param.fromQuery('redirect') redirect: string,
        @Param.queryString() query: string,
    ) {
        // await delay(500);
        // console.log('firebaseToken', firebaseToken);
        // console.log('redirect', redirect);
        // console.log('query', query);
        // debugger;
        try {
            const decoded = await this.firebase.value.verifyToken(firebaseToken);
            const ur = this.userRepository.value;
            // debugger;
            await ur.incrementNoderedTokenVersion(decoded.uid);
            // debugger;
            const token: UserToken = {
                uid: decoded.uid,
                exp: Math.round((new Date().getTime() + 3600000) / 1000),
                scope: 'app-user',
                nodered: await this.nrtokenService.value.generateToken(decoded.uid),
            };

            const tokenStr = await this.jwtService.value.sign(token);
            this.response.cookie(config.jwtCookieName, tokenStr, { secure: !config.isLocal });

            if (typeof redirect === 'string') {
                const redirectUri = Buffer.from(redirect, 'base64').toString();
                return this.response.redirect(redirectUri);
            }
            return this.response.redirect('/');
        } catch (err) {
            console.warn('login: ', err);
            return this.response.redirect(`/login${query ? '?' + query : ''}`);
        }
    }
}

export interface UserToken {
    uid: string;
    exp: number;
    scope: string;
    nodered?: string;
}
