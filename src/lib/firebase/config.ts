import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA7I9A2vj3lrKhR8Hzp2QN2T8HToOpaMxc",
  authDomain: "eventhorizon-7lcta.firebaseapp.com",
  projectId: "eventhorizon-7lcta",
  storageBucket: "eventhorizon-7lcta.appspot.com", // Corrected from firebasestorage.app to appspot.com
  messagingSenderId: "731423513615",
  appId: "1:731423513615:web:db5db26673f028f8c7177a"
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export { app, auth, db };
