import * as firebase from 'firebase';
// import { google } from 'googleapis';
import * as admin from 'firebase-admin';
import * as uuid from 'uuid';

const firebaseConfig = {
  'apiKey': 'AIzaSyDSwqhByneL3wpp3Ek6VdrUA-29nZO96co',
  'appId': '1:206453594509:web:c643e10cafe0c336',
  'databaseURL': 'https://winsen-home.firebaseio.com',
  'storageBucket': 'winsen-home.appspot.com',
  'authDomain': 'winsen-home.firebaseapp.com',
  'messagingSenderId': '206453594509',
  'projectId': 'winsen-home'
};
const tokenStr = 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImEwYjQwY2NjYmQ0OWQxNmVkMjg2MGRiNzIyNmQ3NDZiNmZhZmRmYzAiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiTWVubyBBYmVscyIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS0vQUF1RTdtQzdmOXJHT3hfNUVCeG1XRXJ1OTNlZGFVcWVheWFSRGFNQUZNMVNQdyIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS93aW5zZW4taG9tZSIsImF1ZCI6IndpbnNlbi1ob21lIiwiYXV0aF90aW1lIjoxNTcyMjcxNzk3LCJ1c2VyX2lkIjoiZ3dsaW82OFdOMk1Ncm9oSG56RENER09tcEIyMiIsInN1YiI6Imd3bGlvNjhXTjJNTXJvaEhuekRDREdPbXBCMjIiLCJpYXQiOjE1NzIyNzE3OTcsImV4cCI6MTU3MjI3NTM5NywiZW1haWwiOiJtZW5vLmFiZWxzQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7Imdvb2dsZS5jb20iOlsiMTE0MDEzNDU0OTEzMTk3Nzc2NTk2Il0sImVtYWlsIjpbIm1lbm8uYWJlbHNAZ21haWwuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoiZ29vZ2xlLmNvbSJ9fQ.PYKIbbowbJzOh3XAMOCFaKpdfS8Iha4IStuA_GsLzwADd0gBBF34BfXx5YQJMrD4B1tDJtJELQw6UCeS7GhKKV4LXdKDJl6UlCXKmJiQPw_2NazYN2GEFR0L5LFDtiB8tbOkl6FIz7V13UnW18KckBoM1zUb8S5waZfTlFj-PPb4x9NE6Kdot10VKBW4yL670ocnvm1FvrL1hYjEK2dtM9gclBoNNrdN13afn0Bn4jDdwIKp-FD-Z0Ew8nj4dJrOJCSb5lrHH8FXC9SV9tgYgMbpQDm2OdubZspv8sXeR0lbgvdI4wsKUHpMXFnWoCyGvM63cPs71JS8CI86lYdDmw';
(async () => {
  try {
      const app = firebase.initializeApp(firebaseConfig);
  // const app = firebase.initializeApp(firebaseConfig);
  // const app = admin.initializeApp(firebaseConfig);

  const credential = firebase.auth.GoogleAuthProvider.credential(tokenStr);

  const signed = await firebase.auth(app).signInWithCredential(credential);
  const my = admin.auth().createCustomToken(signed.user.uid);
  // const signed = firebase.auth(app).signInWithCustomToken(tokenStr);
  console.log('Local:', tokenStr, signed, my);
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
