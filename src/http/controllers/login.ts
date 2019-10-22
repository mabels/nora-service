import { Inject, Lazy } from '@andrei-tatar/ts-ioc';
import * as admin from 'firebase-admin';
// import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { FirebaseService } from '../../services/firebase.service';
// import { JwtService } from '../../services/jwt.service';
import { NoderedTokenService } from '../../services/nodered-token.service';
import { UserToken } from '../../services/user-token';
import { UserRepository } from '../../services/user.repository';
// import { delay } from '../../util';
import { Http } from '../decorators/http';
import { Param } from '../decorators/param';
import { Controller } from './controller';

@Http.controller('/login')
export class LoginController extends Controller {

    constructor(
        @Inject(UserRepository)
        private userRepository: Lazy<UserRepository>,
        // @Inject(JwtService)
        // private jwtService: Lazy<JwtService>,
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

    @Http.get('/local')
    async localLogin(
        @Param.fromQuery('token') tokenId: string
    ) {
        console.log('Local:', tokenId);
        admin.initializeApp({
            credential: admin.credential.refreshToken(tokenId),
            databaseURL: 'https://winsen-home.firebaseio.com'
        });
        const db = admin.firestore();
        const res = await db.collection('uid').get();
        console.log(res);
    }

    @Http.post()
    async doLogin(
        @Param.fromBody('token') firebaseToken: string,
        @Param.fromQuery('redirect') redirect: string,
        @Param.queryString() query: string,
    ) {
        try {
            console.log('doLogin-1');
            const decoded = await this.firebase.value.verifyToken(firebaseToken);
            console.log('doLogin-2');
            const ur = this.userRepository.value;
            await ur.incrementNoderedTokenVersion(decoded.uid);
            console.log('doLogin-3');
            const token: admin.auth.SessionCookieOptions & UserToken = {
                uid: firebaseToken,
                expiresIn: 60 * 60 * 1000,
                scope: 'app-user',
                nodered: await this.nrtokenService.value.generateToken(decoded.uid)
            };

            console.log('doLogin-4');
            const tokenStr = await this.firebase.value.signSession(token);
            const config = await this.config();
            this.response.cookie(config.jwtCookieName, tokenStr, { secure: !config.isLocal });

            console.log(`Token:`, tokenStr, redirect);
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
