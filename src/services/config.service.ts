import { ServiceAccount } from 'firebase-admin';
import * as functions from 'firebase-functions';
import { PoolConfig } from 'pg';

import {
    Config,
    ConfigFirebase,
    ConfigPostgres,
    ConfigServiceAccount,
    ConfigServiceSocket,
    ConfigServiceSockets,
    ConfigSrc,
    ConfigTls,
    ConfigValue,
    ServiceSocket,
    StringConfigTls,
    StringPoolConfig,
    StringConfigFirebase,
} from '../config';
import { envConfigFactory } from './env.config';
import { localConfigFactory } from './local.config.factory';

function cvalBoolean(t?: boolean): ConfigValue<boolean> {
    return {
        val: false,
        src: 'Default',
        set: function(src: ConfigSrc, val?: string | boolean) {
            this.src = src;
            this.val = false;
            if (val === 'string') {
                val = val.toUpperCase();
                if (val.startsWith('ON') || val.startsWith('Y') || val.startsWith('T')) {
                    this.val = true;
                } else {
                    this.val = ~~val !== 0;
                }
            } else {
                this.val = !!val;
            }
        },
    };
}

function cvalString(t?: string): ConfigValue<string> {
    return {
        val: typeof t === 'string' ? t : '',
        src: 'Default',
        set: function(src: ConfigSrc, val?: string) {
            this.src = src;
            if (typeof val !== 'undefined') {
                this.val = '' + val;
            }
        },
    };
}

function cvalNumber(t?: number | string): ConfigValue<number> {
    return {
        val: typeof t === 'number' ? t : 0,
        src: 'Default',
        set: function(src: ConfigSrc, val?: string) {
            this.src = src;
            if (typeof val === 'number') {
                this.val = val;
            }
            if (typeof val === 'string') {
                this.val = ~~val;
            }
        },
    };
}

class FirebaseDefault implements ConfigFirebase {
    constructor(
        public apiKey = cvalString('AIzaSyD8tzIdGqx18PHSBqfOZ258FCch5Xk8y38'),
        public authDomain = cvalString('node-red-home-automation-82192.firebaseapp.com'),
        public databaseURL = cvalString('https://node-red-home-automation-82192.firebaseio.com'),
        public projectId = cvalString('node-red-home-automation-82192'),
        public storageBucket = cvalString('node-red-home-automation-82192.appspot.com'),
        public messagingSenderId = cvalString('350438145283'),
        public remoteInitUrl = cvalString('/login/init.js'),
        public jsBaseUrl = cvalString('https://www.gstatic.com/firebasejs/5.6.0'),
        public uiBaseUrl = cvalString('../module/firebaseui/dist'),
    ) {}

    public get val(): StringConfigFirebase {
        return {
            apiKey: this.apiKey.val,
            authDomain: this.authDomain.val,
            databaseURL: this.databaseURL.val,
            projectId: this.projectId.val,
            storageBucket: this.storageBucket.val,
            messagingSenderId: this.messagingSenderId.val,
            remoteInitUrl: this.remoteInitUrl.val,
            jsBaseUrl: this.jsBaseUrl.val,
            uiBaseUrl: this.uiBaseUrl.val,
        };
    }
    public src: ConfigSrc;
    public set(src: ConfigSrc, val?: StringConfigFirebase) {
        this.apiKey.set(src, val?.apiKey);
        this.authDomain.set(src, val?.authDomain);
        this.databaseURL.set(src, val?.databaseURL);
        this.projectId.set(src, val?.projectId);
        this.storageBucket.set(src, val?.storageBucket);
        this.messagingSenderId.set(src, val?.messagingSenderId);
        this.remoteInitUrl.set(src, val?.remoteInitUrl);
        this.jsBaseUrl.set(src, val?.jsBaseUrl);
        this.uiBaseUrl.set(src, val?.uiBaseUrl);
    }

}

class ServiceAccountDefault implements ConfigServiceAccount {
    constructor(
        public projectId = cvalString('project_id'),
        public clientEmail = cvalString('client_email'),
        public privateKey = cvalString('private_key'),
    ) {}
    public get val(): ServiceAccount {
        return {
            projectId: this.projectId.val,
            clientEmail: this.clientEmail.val,
            privateKey: this.privateKey.val,
        };
    }

    src: ConfigSrc;
    set(src: ConfigSrc, val?: ServiceAccount) {
        this.projectId.set(src, val?.projectId);
        this.clientEmail.set(src, val?.clientEmail);
        this.privateKey.set(src, val?.privateKey);
    }
}

class PostgresDefault implements ConfigPostgres {
    constructor(
        public connectionString = cvalString('connectionString'),
        public ssl = cvalBoolean(false),
        public max = cvalNumber(5),
        public idleTimeoutMillis = cvalNumber(4 * 3600 * 1000),
        public connectionTimeoutMillis = cvalNumber(2000),
    ) {}

    public get val(): PoolConfig {
        return {
            connectionString: this.connectionString.val,
            ssl: this.ssl.val,
            max: this.max.val,
            idleTimeoutMillis: this.idleTimeoutMillis.val,
            connectionTimeoutMillis: this.connectionTimeoutMillis.val,
        };
    }
    src: ConfigSrc;
    set(src: ConfigSrc, val?: StringPoolConfig) {
        this.connectionString.set(src, val?.connectionString);
        this.ssl.set(src, val?.ssl);
        this.max.set(src, val?.max);
        this.idleTimeoutMillis.set(src, val?.idleTimeoutMillis);
        this.connectionTimeoutMillis.set(src, val?.connectionTimeoutMillis);
    }
}

export class TlsDefault implements ConfigTls {
    public readonly key: ConfigValue<string, string> = cvalString(undefined);
    public readonly cert: ConfigValue<string, string> = cvalString(undefined);
    public src: ConfigSrc;
    set(src: ConfigSrc, val?: StringConfigTls) {
        this.key.set(src, val?.key);
        this.cert.set(src, val?.cert);
    }
    public get val(): StringConfigTls {
        if (typeof this.key.val === 'string' && this.key.val.length &&
            typeof this.cert.val === 'string' && this.cert.val.length) {
            return {
                key: this.key.val,
                cert: this.cert.val
            };
        }
    }
}

export class ServiceSocketDefault implements ConfigServiceSocket {
    public readonly port: ConfigValue<number, string> = cvalNumber(9999);
    public readonly address: ConfigValue<string, string> = cvalString('');
    public readonly useHttp2: ConfigValue<boolean, string> = cvalBoolean(false);
    public readonly tls: ConfigTls = new TlsDefault();
    public get val(): ServiceSocket {
        return {
            port: this.port.val,
            address: this.address.val,
            useHttp2: this.useHttp2.val,
            tls: this.tls.val
        };
    }
    src: ConfigSrc;
    set(src: ConfigSrc, val?: ServiceSocket) {
        this.port.set(src, val?.port);
        this.address.set(src, val?.address);
        this.useHttp2.set(src, val?.useHttp2);
        this.tls.set(src, val?.tls);
    }


}

export class ConfigService implements Config {
    public readonly fireBase: ConfigFirebase = new FirebaseDefault();
    public readonly serviceSockets: ConfigServiceSockets = [new ServiceSocketDefault()];
    public readonly serviceAccount: ConfigServiceAccount = new ServiceAccountDefault();
    public readonly postgres: ConfigPostgres = new PostgresDefault();

    // public readonly style = cvalString('Default');
    public readonly isLocal = cvalBoolean(false);
    public readonly secureCookie = cvalBoolean(false);
    public readonly appTitle = cvalString('NORA');
    public readonly redirectBaseUrl = cvalString('');
    public readonly userRepositoryBackend = cvalString('pg') as ConfigValue<'pg' | 'fb'>;

    public readonly oauthClientId = cvalString('oauthClientId');
    public readonly oauthClientSecret = cvalString('oauthClientSecret');
    public readonly jwtCookieName = cvalString('auth:nora');
    public readonly googleProjectApiKey = cvalString('googleProjectApiKey');

    public readonly oauthProjectId = cvalString('');
    public readonly jwtSecret = cvalString('');

    public readonly noraServiceUrl = cvalString('node-red');

    public readonly userAdminUid = cvalString('userAdminUid');

    public readonly pleaForDonation = cvalString(`<h1 class="h6 mt-3 font-weight-normal">
                                        Do you like ${this.appTitle.val} and find it useful? Consider donating
                                        <a href="https://paypal.me/andreitatar">Paypal Me</a></h1>`);
}

export function fixRefs(src: Config) {
    if (!src.oauthProjectId.val.length) {
        src.oauthProjectId.set(this.serviceAccount.projectId.src, this.serviceAccount.projectId.val);
    }
    if (!src.jwtSecret.val.length) {
        src.jwtSecret.set(this.serviceAccount.privateKey.src, this.serviceAccount.privateKey.val);
    }
    return src;
}

export function configFactory(): Config {
    return fixRefs(envConfigFactory(localConfigFactory(new ConfigService()),
      process?.env || {},
      (typeof process.env.FIREBASE_CONFIG !== 'undefined' && functions.config().nora) || {}));
}
