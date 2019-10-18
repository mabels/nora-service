import { Inject, Lazy } from '@andrei-tatar/ts-ioc';
// import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { FirebaseService } from '../../services/firebase.service';
import { JwtService } from '../../services/jwt.service';
import { NoderedTokenService } from '../../services/nodered-token.service';
import { UserRepository } from '../../services/user.repository';
// import { delay } from '../../util';
import { Http } from '../decorators/http';
import { Param } from '../decorators/param';
import { Controller } from './controller';
import { UserToken } from '../../services/user-token';

@Http.controller('/login')
export class LoginController extends Controller {

    constructor(
        @Inject(UserRepository)
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
        const authClientConfig = (await this.config()).authClientConfig;
        return await this.renderTemplate('login', {
            loginFormUrl: `${await this.redirectUrl('/login')}${query ? '?' + query : ''}`,
            authClientConfig:
                typeof authClientConfig === 'object' ?
                JSON.stringify(authClientConfig) :
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
        try {
            const decoded = await this.firebase.value.verifyToken(firebaseToken);
            const ur = this.userRepository.value;
            await ur.incrementNoderedTokenVersion(decoded.uid);
            const token: UserToken = {
                uid: decoded.uid,
                exp: Math.round((new Date().getTime() + 3600000) / 1000),
                scope: 'app-user',
                nodered: await this.nrtokenService.value.generateToken(decoded.uid),
            };

            const tokenStr = await this.jwtService.value.sign(token);
            const config = await this.config();
            this.response.cookie(config.jwtCookieName, tokenStr, { secure: !config.isLocal });

            if (typeof redirect === 'string') {
                const redirectUri = Buffer.from(redirect, 'base64').toString();
                return await this.redirect(redirectUri);
            }
            return await this.redirect('/');
        } catch (err) {
            console.warn('login: ', err);
            return await this.redirect(`/login${query ? '?' + query : ''}`);
        }
    }
}
