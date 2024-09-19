import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; 
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyCDa_2s67IEGFmwgjHdUKLi9PoW-mbB6Hg",
    authDomain: "bkarts-11.firebaseapp.com",
    projectId: "bkarts-11",
    storageBucket: "bkarts-11.appspot.com",
    messagingSenderId: "616704223125",
    appId: "1:616704223125:web:5d0e8e1dd0da1f9948389c"
  };

const app = initializeApp(firebaseConfig);


const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage }; 
