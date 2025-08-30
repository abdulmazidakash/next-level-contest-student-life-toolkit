
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);



// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyA8u9tMhXpbvWFWwTSvvqyqXLmTqQbfS-c",
//   authDomain: "student-life-toolkit-4462d.firebaseapp.com",
//   projectId: "student-life-toolkit-4462d",
//   storageBucket: "student-life-toolkit-4462d.firebasestorage.app",
//   messagingSenderId: "579552613878",
//   appId: "1:579552613878:web:d227531b325c911e1e23d7"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

