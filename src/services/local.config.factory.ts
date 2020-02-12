import * as fs from 'fs';

import { Config } from '../config';

export function localConfigFactory(src: Config, fname = './config.local.json') {
  if (!fs.existsSync(fname)) {
    return;
  }
  const read = JSON.parse(fs.readFileSync(fname).toString('utf-8'));
  const my = 'Local';
  src.isLocal.set(my, read.isLocal || true);
  src.secureCookie.set(my, read.secureCookie || false);
  src.appTitle.set(my, read.appTitle);

  src.serviceSockets[0].address.set(my, read.serviceSocket?.address);
  src.serviceSockets[0].port.set(my, read.serviceSocket?.port);
  src.serviceSockets[0].useHttp2.set(my, read.serviceSocket?.useHttp2);
  src.serviceSockets[0].tls.cert.set(my, read.serviceSocket?.tls?.cert);
  src.serviceSockets[0].tls.key.set(my, read.serviceSocket?.tls?.key);

  src.serviceSockets[0].address.set(my, read.serviceSockets[0].address);
  src.serviceSockets[0].port.set(my, read.serviceSockets[0].port);
  src.serviceSockets[0].useHttp2.set(my, read.serviceSockets[0].useHttp2);
  src.serviceSockets[0].tls.cert.set(my, read.serviceSockets[0].tls?.cert);
  src.serviceSockets[0].tls.key.set(my, read.serviceSockets[0].tls?.key);

  src.oauthClientId.set(my, read.oauthClientId);
  src.oauthClientSecret.set(my, read.oauthClientSecret);
  src.jwtCookieName.set(my, read.jwtCookieName);
  src.googleProjectApiKey.set(my, read.googleProjectApiKey);
  src.serviceAccount.set(my, read.serviceAccount);
  src.oauthProjectId.set(my, read.oauthProjectId);
  src.jwtSecret.set(my, read.jwtSecret);
  src.noraServiceUrl.set(my, read.noraServiceUrl);

  src.postgres.set(my, read.postgres);

  src.userAdminUid.set(my, read.userAdminUid);
  src.fireBase.set(my, read.fireBase);

  src.pleaForDonation.set(my, read.pleaForDonation);

  return src;
}
