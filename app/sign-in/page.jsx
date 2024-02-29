"use client";
import { useState } from "react";
import React from "react";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, firestore } from "@/app/firebase/config";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signInWithEmailAndPassword] = useSignInWithEmailAndPassword(auth);
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      const res = await signInWithEmailAndPassword(email, password);
      console.log({ res });
      if (!res) {
        console.error("Sign in failed. Please try again.");
        toast.error("Login fehlgeschlagen!");
        setEmail("");
        setPassword("");
        return;
      } else {
        // Holen Sie die Benutzerdaten aus der Firestore-Datenbank
        if (res.user && res.user.uid) {
          const userDocRef = doc(firestore, "user", res.user.uid);
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();
            res.user.githubName = userData.githubName;
            res.user.displayName = userData.displayName;
            res.user.index = userData.index;
          } else {
            console.log("No such document!");
          }
        } else {
          console.error("User or user ID is null or undefined");
        }

        sessionStorage.setItem("user", true);
        setEmail("");
        setPassword("");
        router.push("/");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <ToastContainer />
      <div className="bg-gray-800 p-10 rounded-lg shadow-xl w-96">
        <h1 className="text-white text-2xl mb-5">Sign In</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
        />
        <button
          onClick={handleSignIn}
          className="w-full p-3 bg-indigo-600 rounded text-white hover:bg-indigo-500"
        >
          Sign In
        </button>
        <button
          className="text-slate-500	text-center w-full"
          onClick={() => {
            sendPasswordResetEmail(auth, email)
              .then(() => {
                console.log("Password reset email sent!");
                toast.success("Email gesendet!");
              })
              .catch((e) => {
                toast.error("Email nicht vorhanden!");
                console.error(e);
              });
          }}
        >
          Password zurücksetzen
        </button>
      </div>
    </div>
  );
};

export default SignIn;
