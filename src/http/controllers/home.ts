import { Inject, Lazy } from '@andrei-tatar/ts-ioc';
import { JwtService } from '../../services/jwt.service';
import { NoderedTokenService } from '../../services/nodered-token.service';
import { UserRepository } from '../../services/user.repository';
import { Http } from '../decorators/http';
import { Controller } from './controller';

@Http.controller('/')
export class HomeController extends Controller {

    constructor(
        @Inject(UserRepository) private userRepo: Lazy<UserRepository>,
        @Inject(NoderedTokenService) private nrtokenService: Lazy<NoderedTokenService>,
        @Inject(JwtService) private jwtService: Lazy<JwtService>,
    ) {
        super();
    }

    @Http.get()
    async get() {
        if (!this.request.token) {
            // const my = this.request.get('baseUrl');
            return await this.redirect('/login');
        }
        const token = await this.request.token.nodered;
        return await this.renderTemplate('home', {
            token,
            donationHtml: (await this.config()).donationHtml || '',
            revokeUrl: await this.redirectUrl('/revoke')
        });
    }

    @Http.get('/privacy')
    async getPrivacyPolicy() {
        return await this.renderTemplate('home-privacy');
    }

    @Http.get('/revoke')
    async revokeToken() {
        if (!this.request.token) {
            return await this.redirect('/login');
        }
        const uid = this.request.token.uid;
        await this.userRepo.value.incrementNoderedTokenVersion(uid);

        const newToken = {
            ...this.request.token,
            nodered: await this.nrtokenService.value.generateToken(uid),
        };

        const tokenStr = await this.jwtService.value.sign(newToken);
        const config = await this.config();
        this.response.cookie(config.jwtCookieName, tokenStr,
            { secure: !config.isLocal }
        );
        return await this.redirect('/');
    }
}
