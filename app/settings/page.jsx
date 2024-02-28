'use client'
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { sendPasswordResetEmail, signOut } from "firebase/auth";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Page = () => {
    const [user] = useAuthState(auth);
    const router = useRouter();
    const [userSession, setUserSession] = useState(null);

    useEffect(() => {
        if (user) {
            setUserSession(user);
        }
    }, [user]);

    const handleBack = () => {
        router.back();
    };

    const handleSignOut = () => {
        signOut(auth);
        setUserSession(null);
    };

    if (!user && !userSession) {
        router.push("../sign-in");
        return null;
    } else {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                    transition={Bounce}
                />
                <div className="bg-gray-800 p-10 rounded-lg shadow-xl w-96">
                    <div className="mb-5">
                        <button onClick={handleBack} className="text-white">
                            {"< Back"}
                        </button>
                    </div>
                    <h1 className="text-white text-2xl mb-5">Settings</h1>
                    <button
                        onClick={() => {
                            sendPasswordResetEmail(auth, user.email)
                                .then(() => {
                                    console.log("Password reset email sent!");
                                    toast.success("Email gesendet!");
                                })
                                .catch((e) => {
                                    toast.error("Email nicht vorhanden!");
                                    console.error(e);
                                });
                        }}
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
    }
};

export default Page;