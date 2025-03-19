import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  User,
  UserCredential,
  onAuthStateChanged,
} from "firebase/auth";
import Swal from "sweetalert2";

interface AuthContextType {
  user: User | null;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<UserCredential>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    }, (error) => {
      console.error("Auth state error:", error);
      Swal.fire({
        title: "Authentication Error",
        text: "Failed to initialize authentication. Please try again.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
    } catch (error) {
      console.error("Email login error:", error);
      Swal.fire({
        title: "Login Failed",
        text: "Invalid email or password. Please try again.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
      throw error;
    }
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
    } catch (error) {
      console.error("Email signup error:", error);
      Swal.fire({
        title: "Signup Failed",
        text: "Could not create account. Please check your details and try again.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
      throw error;
    }
  }, []);

  const loginWithGoogle = useCallback(async (): Promise<UserCredential> => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      setUser(userCredential.user);
      return userCredential;
    } catch (error) {
      console.error("Google login error:", error);
      Swal.fire({
        title: "Google Login Failed",
        text: "Unable to sign in with Google. Please try again.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
      throw error;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      Swal.fire({
        title: "Logout Failed",
        text: "Could not sign out. Please try again.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
      throw error;
    }
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, loginWithEmail, signUpWithEmail, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};