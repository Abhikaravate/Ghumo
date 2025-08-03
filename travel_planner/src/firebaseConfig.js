// src/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { data } from "react-router-dom";

// TODO: Replace the following with your app's Firebase project configuration
// This is the object you copied from the Firebase console in Step 1
const firebaseConfig = {
  apiKey: "AIzaSyB6fz4cQbh9IS2kX_WcqOTQDHFATBJcNfc",
  authDomain: "ghumo-349cf.firebaseapp.com",
  projectId: "ghumo-349cf",
  storageBucket: "ghumo-349cf.appspot.com",
  messagingSenderId: "209647680828",
  appId: "1:209647680828:web:a4888f5f5c957b7c7c7239",
  measurementId: "G-QMPE99WYYZ",
  databaseURL: "https://ghumo-349cf-default-rtdb.firebaseio.com/",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Export the initialized app and database for use in other files
export { app, db };

//changed 