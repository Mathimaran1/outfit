// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
// import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
// import { getFirestore } from 'firebase/firestore';

// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyBBjdzWwFyUs2sHSDtcfc-m0pMQnH6Qt4I",
//   authDomain: "wari-ai.firebaseapp.com",
//   projectId: "wari-ai",
//   storageBucket: "wari-ai.firebasestorage.app",
//   messagingSenderId: "689395524581",
//   appId: "1:689395524581:web:466b64320dd8cacd55c50c",
//   measurementId: "G-ELFV103ES5"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
// const auth = initializeAuth(app, {
//   persistence: getReactNativePersistence(ReactNativeAsyncStorage)
// });
// const db = getFirestore(app);

// export {app, analytics, auth, db};

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBBjdzWwFyUs2sHSDtcfc-m0pMQnH6Qt4I",
  authDomain: "wari-ai.firebaseapp.com",
  projectId: "wari-ai",
  storageBucket: "wari-ai.firebasestorage.app",
  messagingSenderId: "689395524581",
  appId: "1:689395524581:web:466b64320dd8cacd55c50c",
  measurementId: "G-ELFV103ES5"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const db = getFirestore(app);

// export {app, analytics, auth, db};