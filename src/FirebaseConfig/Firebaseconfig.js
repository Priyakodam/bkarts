import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; 
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDRC1AvVW94eYdhhZsQPFqIEXD5OYahhkQ",
  authDomain: "sample-48f51.firebaseapp.com",
  databaseURL: "https://sample-48f51-default-rtdb.firebaseio.com",
  projectId: "sample-48f51",
  storageBucket: "sample-48f51.appspot.com",
  messagingSenderId: "202583393090",
  appId: "1:202583393090:web:6d2a0b76764ce733557edb",
  measurementId: "G-6VFZCXTQ1D"
  };

const app = initializeApp(firebaseConfig);


const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage }; 
