import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyA0Gji83xI-3mCtO41rA_uamAuwKEpYFhU",
  authDomain: "blog-app-7f6d1.firebaseapp.com",
  projectId: "blog-app-7f6d1",
  storageBucket: "blog-app-7f6d1.appspot.com",
  messagingSenderId: "681044057037",
  appId: "1:681044057037:web:f8b499a848ff18a2738284",
};

const app = initializeApp(firebaseConfig);

const provider = new GoogleAuthProvider();

const auth = getAuth();

export const authWithGoogle = async () => {
  let user = null;
  try {
    const result = await signInWithPopup(auth, provider);
    user = result.user;
  } catch (err) {
    console.log(err);
  }
  return user;
};
