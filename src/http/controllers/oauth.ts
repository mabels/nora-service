import * as crypto from 'crypto';
import * as admin from 'firebase-admin';
import { FirebaseService } from '../../services/firebase.service';
import { JwtService } from '../../services/jwt.service';
import { Token } from '../../services/user-token';
import { UserRepository } from '../../services/user.repository';
import { Http } from '../decorators/http';
import { Param } from '../decorators/param';
import { BadRequestError, NotAuthorizedError } from '../middlewares/exception';
import { Controller } from './controller';

type SessionToken = admin.auth.SessionCookieOptions & Token;

@Http.controller('/oauth')
export class OauthController extends Controller {

  readonly expireTimeSeconds = 3600;

  constructor(
    private jwtService: JwtService,
    private firebaseService: FirebaseService,
    private userRepo: UserRepository,
  ) {
    super();
  }

  @Http.get('/auth')
  async authorizeGoogle(
    @Param.fromQuery('yes') yes: string,
    @Param.fromQuery('no') no: string,
  ) {
    const yesLink = Buffer.from(yes, 'base64').toString();
    const noLink = Buffer.from(no, 'base64').toString();
    return this.renderTemplate('oauth', { yesLink, noLink });
  }

  @Http.get()
  async getAuthCode(
    @Param.fromQuery('client_id') clientId: string,
    @Param.fromQuery('redirect_uri') redirectUri: string,
    @Param.fromQuery('response_type') responseType: string,
    @Param.fromQuery('state') state: string,
    @Param.fromQuery('confirm') confirm: boolean = false,
    @Param.fromQuery('auth') auth: boolean = false,
  ) {
    const config = await this.config();
    console.log(`getAuthCode:config:`, config);

    if (clientId !== config.oauthClientId) {
       throw new BadRequestError(`invalid client_id:${clientId}!=${config.oauthClientId}`);
    }

    if (!redirectUri ||
        !redirectUri.startsWith(`https://oauth-redirect.googleusercontent.com/r/${config.projectId || config.oauthClientId}`)) {
       throw new BadRequestError('invalid redirect_uri');
    }
    switch (responseType) {
      case 'code':
      case 'token':
        break;
      default:
        throw Error(`unknown response Type:${responseType}`);
    }

    if (!confirm || !this.request.token || this.request.token.scope !== 'app-user') {
      const redirectPath = `/oauth?confirm=true&` +
        `client_id=${encodeURIComponent(clientId)}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
         `response_type=${encodeURIComponent(responseType)}&` +
         `state=${encodeURIComponent(state)}`;
      const encoded = Buffer.from(redirectPath).toString('base64');

      return await this.redirect(`/login?redirect=${encoded}`);
    }

    if (!auth) {
      const parms = `client_id=${encodeURIComponent(clientId)}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=${encodeURIComponent(responseType)}&` +
        `state=${encodeURIComponent(state)}`;

      const redirectYes = await this.redirectUrl(`/oauth?confirm=true&auth=true&${parms}`);
      const encodedYes = Buffer.from(redirectYes).toString('base64');
      const redirectNo = await this.redirectUrl(`/oauth?${parms}`);
      const encodedNo = Buffer.from(redirectNo).toString('base64');
      return await this.redirect(`/oauth/auth?yes=${encodedYes}&no=${encodedNo}`);
    }

    const authToken: SessionToken = {
      expiresIn: Math.round(new Date().getTime() / 1000) + 600, // 10 min
      scope: 'google-home-authcode',
      uid: this.request.token.uid,
    };
    const authCode = await this.firebaseService.signSession(authToken);
    return await this.redirect(`${redirectUri}?state=${state}&code=${authCode}`);
  }


  @Http.post('/token')
  async handleToken(
    @Param.fromBody('client_id') clientId: string,
    @Param.fromBody('client_secret') clientSecret: string,
    @Param.fromBody('grant_type') grantType: string,
    @Param.fromBody('code') code: string,
    @Param.fromBody('refresh_token') refreshToken: string,
  ) {
    const config = await this.config();
    if (clientId !== config.oauthClientId || clientSecret !== config.oauthClientSecret) {
      throw new Error('invalid client id or secret');
    }

    switch (grantType) {
      case 'authorization_code':
        const authToken = await this.jwtService.verify<SessionToken>(code);
        if (authToken.scope !== 'google-home-authcode') {
          throw new BadRequestError('invalid_scope');
        }

        await this.userRepo.updateUserLinked(authToken.uid, true);
        console.info(`user ${authToken.uid} linked to google home`);

        return {
          token_type: 'Bearer',
          access_token: await this.generateAccessToken(authToken.uid),
          refresh_token: await this.generateRefreshToken(authToken.uid),
          expires_in: this.expireTimeSeconds,
        };

      case 'refresh_token':
        return {
          token_type: 'Bearer',
          access_token: await this.generateAccessTokenFromRefreshToken(refreshToken),
          expires_in: this.expireTimeSeconds,
        };

      default:
        throw new BadRequestError('invalid_grant');
    }
  }

  private async generateAccessToken(uid: string) {
    const user: SessionToken = {
      uid,
      expiresIn: Math.round(new Date().getTime() / 1000) + this.expireTimeSeconds, // 60 min,
      scope: 'google-home-auth',
    };
    const token = await this.jwtService.sign(user);
    return token;
  }

  private async generateRefreshToken(uid: string) {
    const config = await this.config();
    const cipher = crypto.createCipher('aes-256-ctr', config.jwtSecret);
    const refresh = await this.userRepo.getRefreshToken(uid);
    let crypted = cipher.update(`${refresh}:${uid}`, 'utf8', 'base64');
    crypted += cipher.final('base64');
    return crypted;
  }

  private async generateAccessTokenFromRefreshToken(refreshToken: string) {
    const config = await this.config();
    const decipher = crypto.createDecipher('aes-256-ctr', config.jwtSecret);
    let dec = decipher.update(refreshToken, 'base64', 'utf8');
    dec += decipher.final('utf8');
    const parts = dec.split(':');
    if (parts.length !== 2) {
      throw new NotAuthorizedError('invalid refresh token');
    }

    const refresh = parseInt(parts[0], 10);
    if (typeof refresh !== 'number' || !isFinite(refresh)) {
      throw new NotAuthorizedError('invalid refresh token');
    }

    const uid = parts[1];
    if (refresh !== await this.userRepo.getRefreshToken(uid)) {
      throw new NotAuthorizedError('refresh token revoked');
    }

    return await this.generateAccessToken(uid);
  }
}
