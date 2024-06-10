import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
    apiKey: "AIzaSyCyw-6WZKPS5bQW2R6WLAYpwNM_QNWX1cE",
    authDomain: "perpustakaan-d2eda.firebaseapp.com",
    projectId: "perpustakaan-d2eda",
    storageBucket: "perpustakaan-d2eda.appspot.com",
    messagingSenderId: "841628682147",
    appId: "1:841628682147:web:f5b46630dcda035c9efc16"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
