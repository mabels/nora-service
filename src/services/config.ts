export interface Config {
  readonly isLocal: boolean;
  readonly port: string;
  readonly oauthClientId: string;
  readonly oauthClientSecret: string;
  readonly jwtCookieName: string;
  readonly jwtSecret?: string;
  readonly projectId?: string;
  readonly googleProjectApiKey?: string;
  readonly postgressConnectionString?: string;
  readonly serviceAccountIssuer?: string;
  readonly serviceAccountPrivateKey?: string;
  readonly userAdminUid?: string;
  readonly storageBackend?: string;
  readonly baseUrl?: string;
  readonly authClientConfig?: {
    apiKey?: string;
    authDomain?: string;
    databaseURL?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
  };
  readonly donationHtml?: string;
  readonly nora_service?: {
    firebase_init_js_url?: string;
  };
}
