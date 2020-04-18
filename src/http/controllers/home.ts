import { Inject, Lazy } from '@andrei-tatar/ts-ioc';
import * as functions from 'firebase-functions';

import { DevicesRepository } from "../../services/devices.repository";
import { JwtService } from '../../services/jwt.service';
import { NoderedTokenService } from '../../services/nodered-token.service';
import { UserRepository, UserRepositoryFactory } from '../../services/user.repository';
import { Http } from '../decorators/http';
import { Controller } from './controller';

@Http.controller('/')
export class HomeController extends Controller {

    constructor(
        @Inject(UserRepositoryFactory) private userRepo: Lazy<UserRepository>,
        @Inject(NoderedTokenService) private nrtokenService: Lazy<NoderedTokenService>,
        @Inject(JwtService) private jwtService: Lazy<JwtService>,
        @Inject(DevicesRepository) private devices: Lazy<DevicesRepository>,
    ) {
        super();
    }

    @Http.get()
    async get() {
        console.log('Home-Cookies', JSON.stringify(this.request.cookies));
        if (!(this.request.cookies['IDToken'] || this.response.locals.token)) {
            return this.redirect('/login');
        }
        let userDevicesHtml = 'No Token';
        if (this.response.locals.token?.uid) {
            const userDevices = this.devices.value.allDevices[this.response.locals.token?.uid];
            userDevicesHtml = userDevices
                ? JSON.stringify(userDevices, null, 2)
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#039;')
                : 'No devices';
        }
        return await this.renderTemplate('home', {
            userDevicesJson: userDevicesHtml,
            token: this.response.locals.token?.nodered || 'No nora token',
            appTitle: this.config.appTitle.val,
            fireBase: this.config.fireBase.val,
            idToken: this.request.cookies['IDToken'] || 'No Id Token',
            revokeUrl: this.absUrl('/revoke'),
            pleaForDonation: this.config.pleaForDonation.val
        });
    }

    @Http.get('/privacy')
    async getPrivacyPolicy() {
        return await this.renderTemplate('home-privacy', {
        appTitle: this.config.appTitle.val,
        fireBase: this.config.fireBase.val
        });
    }

    @Http.get('/env')
    async getEnv() {
      return JSON.stringify({
        env: process.env,
        fireBase: {
          config: functions.config()
        }
      }, null, 2);
    }

    @Http.get('/terms')
    async getTermsOfService() {
        return await this.renderTemplate('home-tos', {
            appTitle: this.config.appTitle.val,
            fireBase: this.config.fireBase.val
        });
    }

    @Http.get('/revoke')
    async revokeToken() {
        if (!this.response.locals.token) {
            return this.redirect('/login');
        }
        const uid = this.response.locals.token.uid;
        await this.userRepo.value.incrementNoderedTokenVersion(uid);

        const newToken = {
            ...this.response.locals.token,
            nodered: await this.nrtokenService.value.generateToken(uid, this.config.serviceAccount.private_key.val),
        };

        const tokenStr = await this.jwtService.value.sign(newToken, this.config.serviceAccount.private_key.val);
        this.response.cookie(this.config.jwtCookieName.val, tokenStr, { secure: this.config.secureCookie.val });
        return this.redirect('/');
    }
}
