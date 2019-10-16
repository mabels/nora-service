import { Config } from './config';
import { ConfigService } from './config.service';

export class ConfigEnvService implements ConfigService {
  private readonly _config: Config = {
    isLocal: false,
    port: process.env.PORT,
    oauthClientId: process.env.OAUTH_ID,
    oauthClientSecret: process.env.OAUTH_SECRET,
    jwtCookieName: process.env.JWT_COOKIE,
    jwtSecret: process.env.JWT_SECRET,
    projectId: process.env.PROJECT_ID,
    googleProjectApiKey: process.env.PROJECT_API_KEY,
    postgressConnectionString: process.env.DATABASE_URL,
    serviceAccountIssuer: process.env.SERVICE_ACCOUNT_ISSUER,
    serviceAccountPrivateKey: process.env.SERVICE_ACCOUNT_KEY,
    userAdminUid: process.env.USER_ADMIN_UID,
    storageBackend: process.env.STORAGE_BACKEND,
    baseUrl: process.env.BASE_URL,
    authClientConfig:
      process.env.AUTH_CLIENT_CONFIG && JSON.parse(process.env.AUTH_CLIENT_CONFIG),
    donationHtml: process.env.DONATION_HTML
  };

  public async init(): Promise<Config> {
    return this._config;
  }
}

