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
        if (!this.request.token) {
            return this.redirect('/login');
        }

        const userDevices = this.devices.value.allDevices[this.request.token.uid];
        const userDevicesHtml = userDevices
            ? JSON.stringify(userDevices, null, 2)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;')
            : 'No devices';
        const token = await this.request.token.nodered;
        // console.log('RenderTop:', userDevices, userDevicesHtml, token);
        return await this.renderTemplate('home', {
            token, userDevicesJson: userDevicesHtml,
            appTitle: this.config.appTitle.val,
            fireBase: this.config.fireBase.val,
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
        if (!this.request.token) {
            return this.redirect('/login');
        }
        const uid = this.request.token.uid;
        await this.userRepo.value.incrementNoderedTokenVersion(uid);

        const newToken = {
            ...this.request.token,
            nodered: await this.nrtokenService.value.generateToken(uid),
        };

        const tokenStr = await this.jwtService.value.sign(newToken);
        this.response.cookie(this.config.jwtCookieName.val, tokenStr, { secure: this.config.secureCookie.val });
        return this.redirect('/');
    }
}
