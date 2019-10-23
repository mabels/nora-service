import * as firebase from 'firebase';
// import * as admin from 'firebase-admin';
import * as uuid from 'uuid';

const firebaseConfig = {
};
const tokenStr =
(async () => {
;
  try {
      const app = firebase.initializeApp(firebaseConfig);
  // const app = firebase.initializeApp(firebaseConfig);
  // const app = admin.initializeApp(firebaseConfig);

  const credential = firebase.auth.GoogleAuthProvider.credential(tokenStr);

  const signed = await firebase.auth(app).signInWithCredential(credential);
  // const signed = firebase.auth(app).signInWithCustomToken(tokenStr);
  console.log('Local:', tokenStr, signed);
    const db = firebase.firestore(app);
    const qs = await db.collection('uid').get();
    // console.log('QS:', qs);
    qs.forEach(function(doc) {
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.id, ' => ', doc.data());
    });
    db.collection('uid').onSnapshot((mqs) => {
      mqs.docChanges().forEach(change => {
        if (change.type === 'added') {
          console.log('New: ', change.doc.data());
        }
        if (change.type === 'modified') {
          console.log('Modifiedity: ', change.doc.data());
        }
        if (change.type === 'removed') {
          console.log('Removed: ', change.doc.data());
        }
      });
    });
    setInterval(async () => {
      const tick = (new Date()).toISOString();
      console.log('Tick:', tick);
      const id = uuid.v4();
      await db.collection('uid').doc(id).set({
        id,
        tick
      });
      await db.collection('uid').doc('life').set({
        id: 'life',
        tick
      });
    }, 60000);
  } catch (e) {
    console.log('ERROR:firestore:', e);
  }
})();
