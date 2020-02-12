import { FirebaseOptions } from '@firebase/app-types';
import { ServiceAccount } from 'firebase-admin';
import { PoolConfig } from 'pg';

export type ConfigSrc = 'Env' | 'Firebase' | 'Local' | 'Default';

export interface ConfigValue<T, V = string> {
  val: T;
  src: ConfigSrc;
  set(src: ConfigSrc, val?: T | V);
}

export interface StringConfigTls {
  readonly key: string;
  readonly cert: string;
}

export interface ConfigTls extends ConfigValue<StringConfigTls, StringConfigTls> {
  readonly key: ConfigValue<string>;
  readonly cert: ConfigValue<string>;
}

export interface ServiceSocket {
  readonly port: number; // 9999
  readonly address: string;
  readonly useHttp2: boolean;
  readonly tls?: StringConfigTls;
}

export interface ConfigServiceSocket extends ConfigValue<ServiceSocket, ServiceSocket> {
  readonly port: ConfigValue<number>; // 9999
  readonly address: ConfigValue<string>;
  readonly useHttp2: ConfigValue<boolean>;
  readonly tls: ConfigTls;
}

export type ConfigServiceSockets = ConfigServiceSocket[];

export interface ConfigServiceAccount extends ConfigValue<ServiceAccount, ServiceAccount> {
  readonly projectId: ConfigValue<string>;
  readonly clientEmail: ConfigValue<string>;
  readonly privateKey: ConfigValue<string>;
}

export interface StringPoolConfig {
  readonly connectionString?: string;
  readonly ssl?: string;
  readonly max?: string;
  readonly idleTimeoutMillis?: string;
  readonly connectionTimeoutMillis?: string;
}

export interface ConfigPostgres extends ConfigValue<PoolConfig, StringPoolConfig> {
  readonly connectionString: ConfigValue<string>;
  readonly ssl: ConfigValue<boolean>;
  readonly max: ConfigValue<number>; // 5
  readonly idleTimeoutMillis: ConfigValue<number>; // 4 * 3600 * 1000
  readonly connectionTimeoutMillis: ConfigValue<number>; // 2000
}

export interface ConfigFirebase extends ConfigValue<FirebaseOptions, FirebaseOptions> {
  readonly apiKey: ConfigValue<string>; // 'AIzaSyD8tzIdGqx18PHSBqfOZ258FCch5Xk8y38',
  readonly authDomain: ConfigValue<string>; // 'node-red-home-automation-82192.firebaseapp.com',
  readonly databaseURL: ConfigValue<string>; // 'https://node-red-home-automation-82192.firebaseio.com',
  readonly projectId: ConfigValue<string>; // 'node-red-home-automation-82192',
  readonly storageBucket: ConfigValue<string>; // 'node-red-home-automation-82192.appspot.com',
  readonly messagingSenderId: ConfigValue<string>; // '350438145283',
  readonly remoteInitUrl: ConfigValue<string>; // '/login/init.js'
  readonly jsBaseUrl: ConfigValue<string>; // 'https://www.gstatic.com/firebasejs/5.6.0';
}

export interface Config {

  readonly serviceSockets: ConfigServiceSockets;
  readonly serviceAccount: ConfigServiceAccount;

  readonly postgres: ConfigPostgres;
  readonly fireBase: ConfigFirebase;

  readonly isLocal: ConfigValue<boolean>;
  readonly secureCookie: ConfigValue<boolean>;
  readonly appTitle: ConfigValue<string>;

  readonly oauthClientId: ConfigValue<string>;
  readonly oauthClientSecret: ConfigValue<string>;
  readonly oauthProjectId: ConfigValue<string>;

  readonly jwtCookieName: ConfigValue<string>;
  readonly googleProjectApiKey: ConfigValue<string>;

  readonly jwtSecret: ConfigValue<string>;

  readonly noraServiceUrl: ConfigValue<string>; // 'node-red'

  readonly userAdminUid: ConfigValue<string>;

  readonly pleaForDonation: ConfigValue<string>; // `<h1 class="h6 mt-3 font-weight-normal">
                                    // Do you like ${appTitle} and find it useful? Consider donating
                                    // <a href="https://paypal.me/andreitatar">Paypal Me</a></h1>`
}
