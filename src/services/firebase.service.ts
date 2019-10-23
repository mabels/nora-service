import { Inject } from '@andrei-tatar/ts-ioc';
import * as admin from 'firebase-admin';
import { Token } from '../services/user-token';
import { Config } from './config';
import { ConfigService } from './config.service';

export class FirebaseService {
  private _config?: Config;
  private _admin?: admin.app.App;

  constructor(
    @Inject('ConfigService')
    private readonly config: ConfigService
  ) {}

  async getAdmin(tokenId?: string) {
    if (!this._admin) {
      if (typeof this._config.serviceAccountPrivateKey === 'string') {
        console.log(`FireBaseService:fromConfig`);
        this._admin = admin.initializeApp({
          credential: admin.credential.cert({
            projectId: this._config.projectId,
            clientEmail: this._config.serviceAccountIssuer,
            privateKey: this._config.serviceAccountPrivateKey
          })
        });
      } else {
        const param: admin.AppOptions = {};
        if (this._config.serviceAccountIssuer) {
          param.serviceAccountId = this._config.serviceAccountIssuer;
        }
        if (tokenId) {
          param.credential = admin.credential.refreshToken(tokenId);
        }
        if (this._config.authClientConfig &&
            this._config.authClientConfig.databaseURL) {
          param.databaseURL = this._config.authClientConfig.databaseURL;
        }
        if (this._config.projectId) {
          param.projectId = this._config.projectId;
        }
        console.log(`FireBaseService:fromGoogle:`, param, tokenId);
        this._admin = admin.initializeApp(param);
      }
    }
    return this._admin;
  }

  async getAuth(token?: string): Promise<admin.auth.Auth> {
    return (await this.getAdmin(token)).auth();
  }

  async getConfig() {
    if (!this._config) {
      this._config = await this.config.init();
    }
    return this._config;
  }

  async signSession(
    payload: admin.auth.SessionCookieOptions & Token
  ): Promise<string> {
    if (!payload.uid) {
      throw Error('sign !uid not implement:' + JSON.stringify(payload));
    }
    const x = admin.auth().createSessionCookie(payload.uid, payload);
    console.log('signSession:', JSON.stringify(payload, undefined, 2), x);
    return x;
  }

  async sign<T extends Token>(payload: T): Promise<string> {
    // admin.auth().createProviderConfig()
    if (!payload.uid) {
      throw Error('sign !uid not implement:' + JSON.stringify(payload));
    }
    //    if (payload.exp) {
    //  const x = admin.auth().(payload.uid, payload);
    //  console.log('sign:', JSON.stringify(payload, undefined, 2), x);
    //  return x;
    //    } else {
    const x = (await this.getAuth()).createCustomToken(payload.uid, payload);
    console.log('sign:', JSON.stringify(payload, undefined, 2), x);
    return x;
    //    }
  }

  async verifyToken(token: string) {
    await this.getConfig();
    const decoded = (await this.getAuth(token)).verifyIdToken(token);
    // if (decoded.firebase.sign_in_provider === "password") {
    //   if (decoded.uid !== "SaZLefUTKJYSPTbb2PrZRsU0Sr33") {
    //     throw new Error("Only test user can login with e-mail/password");
    //   }
    // }
    return decoded;
  }
}
