
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase.config";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import Swal from "sweetalert2";
import { getJwtToken, upsertUser } from "../services/authApi";

const AuthContext = createContext(null);
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

const provider = new GoogleAuthProvider();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loginGoogle = async () => {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  };

  const loginEmail = (email, pass) => signInWithEmailAndPassword(auth, email, pass);
  const registerEmail = (email, pass, name) =>
    createUserWithEmailAndPassword(auth, email, pass).then(async (res) => {
      await updateProfile(res.user, { displayName: name });
      return res.user;
    });

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem("slt_token");
    Swal.fire("Logged out", "See you soon!", "success");
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (current) => {
      setUser(current);
      if (current?.email) {
        try {
          // upsert user in backend and get JWT
          await upsertUser(current.email, {
            name: current.displayName || "User",
            email: current.email,
            photoURL: current.photoURL || "",
          });
          const tokenData = await getJwtToken({ email: current.email });
          if (tokenData) localStorage.setItem("slt_token", tokenData);
        } catch (err) {
          console.error(err);
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const value = { user, loading, loginGoogle, loginEmail, registerEmail, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

