// Import necessary modules
'use client'
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";
import { useRouter } from "next/navigation";
import { sendPasswordResetEmail, signOut } from "firebase/auth";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Page = () => {
    const [user] = useAuthState(auth);
    const [userSession, setUserSession] = useState(null);
    const router = useRouter();

    // Move the useRouter hook inside the useEffect
    useEffect(() => {

        if (user) {
            setUserSession(user);
        } else if (!userSession) {
            // Use router.push instead of router.push("../sign-in")
            router.push("/sign-in");
        }
    }, [user, userSession]);

    const handleBack = () => {
        router.push("/")
    };
    const handleSignOut = async () => {
        try {
            await signOut(auth);
            setUserSession(null);
        } catch (e) {
            toast.error(e.message);
        }
    };

    const handleResetPassword = async () => {
        try {
            await sendPasswordResetEmail(auth, user.email);
            toast.success("Email gesendet!");
        } catch (e) {
            toast.error("Email nicht vorhanden!");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <ToastContainer />
            <div className="bg-gray-800 p-10 rounded-lg shadow-xl w-96">
                <div className="mb-5">
                    <button onClick={handleBack} className="text-white">
                        {"< Back"}
                    </button>
                </div>
                <h1 className="text-white text-2xl mb-5">Settings</h1>
                <button
                    onClick={handleResetPassword}
                    className="w-full p-3 bg-indigo-600 rounded text-white hover:bg-indigo-500 mb-4"
                >
                    Reset Password
                </button>
                <button
                    onClick={handleSignOut}
                    className="w-full p-3 bg-red-600 rounded text-white hover:bg-red-500"
                >
                    Log out
                </button>
            </div>
        </div>
    );
};

export default Page;
