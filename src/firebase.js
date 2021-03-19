import firebase from 'firebase/app';
import 'firebase/firestore';

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAKxJRo05WFJX8DS_1qXKOIwiUKTPMc6HI",
    authDomain: "avatars-app.firebaseapp.com",
    projectId: "avatars-app",
    storageBucket: "avatars-app.appspot.com",
    messagingSenderId: "648408796594",
    appId: "1:648408796594:web:417d9c9acde064d24ae8ab"
};


if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export const db = firebase.firestore();

export default firebase;
