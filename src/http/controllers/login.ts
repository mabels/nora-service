import { Inject, Lazy } from '@andrei-tatar/ts-ioc';
import * as firebase from 'firebase';
// import * as admin from 'firebase-admin';
// import * as admin from 'firebase-admin';
// import * as functions from 'firebase-functions';
// import * as admin from 'firebase-admin';
import { FirebaseService } from '../../services/firebase.service';
// import { JwtService } from '../../services/jwt.service';
// import { NoderedTokenService } from '../../services/nodered-token.service';
// import { UserToken } from '../../services/user-token';
import { UserRepository } from '../../services/user.repository';
// import { delay } from '../../util';
import { Http } from '../decorators/http';
import { Param } from '../decorators/param';
import { Controller } from './controller';

@Http.controller('/login')
export class LoginController extends Controller {
  constructor(
    @Inject(UserRepository)
    private userRepository: Lazy<UserRepository>,
    // @Inject(JwtService)
    // private jwtService: Lazy<JwtService>,
    @Inject(FirebaseService)
    private firebaseService: Lazy<FirebaseService>
  ) // @Inject(NoderedTokenService)
  // private nrtokenService: Lazy<NoderedTokenService>,
  {
    super();
  }

  @Http.get()
  async getLoginTemplate(@Param.queryString() query: string) {
    const config = await this.config();
    // const fbConfig = functions.config();
    const authClientConfig = config.authClientConfig;
    return await this.renderTemplate('login', {
      loginFormUrl: `${await this.redirectUrl('/login')}${
        query ? '?' + query : ''
      }`,
      authClientConfig:
        typeof authClientConfig === 'object'
          ? JSON.stringify(authClientConfig)
          : 'undefined',
      scriptFireBaseInitJs:
        typeof config.nora_service === 'object' &&
        typeof config.nora_service.firebase_init_js_url === 'string'
          ? `<script src='${config.nora_service.firebase_init_js_url}'></script>`
          : '',
    });
  }

  @Http.get('/local')
  async localLogin(@Param.fromQuery('injectIdToken') tokenId: string) {
    /*
        const app = admin.initializeApp({
            //  databaseURL: 'https://winsen-home.firebaseio.com',
             projectId: 'winsen-home'
        });
        console.log('InjectToken:', tokenId, app.options.databaseURL);
        const ret = await admin.auth().verifyIdToken(tokenId);
        */
    firebase.initializeApp({
      apiKey: 'AIzaSyDSwqhByneL3wpp3Ek6VdrUA-29nZO96co',
      projectId: 'winsen-home',
    });
    const signed = firebase.auth().signInWithCustomToken(tokenId);

    console.log('Local:', tokenId, signed);
    const db = firebase.firestore();
    const res = await db.collection('uid').get();
    console.log(res);
  }

  @Http.post()
  async doLogin(
    @Param.fromBody('token') firebaseToken: string,
    @Param.fromQuery('redirect') redirect: string,
    @Param.queryString() query: string
  ) {
    try {
      console.log('doLogin-1');
      const decoded = await this.firebaseService.value.verifyToken(
        firebaseToken
      );
      console.log('doLogin-2', firebaseToken);
      const ur = this.userRepository.value;
      await ur.incrementNoderedTokenVersion(decoded.uid);
      console.log('doLogin-3');
      // const token: admin.auth.SessionCookieOptions & UserToken = {
      //     uid: firebaseToken,
      //     expiresIn: 60 * 60 * 1000,
      //     scope: 'app-user',
      //     nodered: await this.nrtokenService.value.generateToken(decoded.uid)
      // };

      console.log('doLogin-4');
      // const tokenStr = await admin.auth().createCustomToken(decoded.uid);
      // console.log('doLogin-5', ctoken);
      // const tokenStr = await this.firebaseService.value.signSession(token);
      // const config = await this.config();
      // this.response.cookie(config.jwtCookieName, tokenStr, { secure: !config.isLocal });

      // console.log(`Token:`, tokenStr, redirect);

    //   const app = firebase.initializeApp({
    //     apiKey: 'AIzaSyDSwqhByneL3wpp3Ek6VdrUA-29nZO96co',
    //     projectId: 'winsen-home',
    //   });
    //   const signed = firebase.auth(app).signInWithCustomToken(tokenStr);
    //   console.log('Local:', tokenStr, signed);
    //   try {
    //     const db = firebase.firestore(app);
    //     const qs = await db.collection('uid').get();
    //     console.log('QS:', qs);
    //     qs.forEach(function(doc) {
    //         // doc.data() is never undefined for query doc snapshots
    //         console.log(doc.id, ' => ', doc.data());
    //     });
    //   } catch (e) {
    //     console.log('ERROR:firestore:', e);
    //   }

      if (typeof redirect === 'string') {
        const redirectUri = Buffer.from(redirect, 'base64').toString();
        return await this.redirect(redirectUri);
      }
      return await this.redirect('/');
    } catch (err) {
      console.warn('login: ', err);
      return await this.redirect(`/login${query ? '?' + query : ''}`);
    }
  }
}
