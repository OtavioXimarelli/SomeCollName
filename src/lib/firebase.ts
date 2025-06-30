// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAKA_3GWf7g93d8m-06ZHiu3RUIhBNV2ho",
  authDomain: "somecoolname-aa9b5.firebaseapp.com",
  projectId: "somecoolname-aa9b5",
  storageBucket: "somecoolname-aa9b5.firebasestorage.app",
  messagingSenderId: "56034488200",
  appId: "1:56034488200:web:b3c5adb895eee3727ed43d",
  measurementId: "G-M0TDRDTH1R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
