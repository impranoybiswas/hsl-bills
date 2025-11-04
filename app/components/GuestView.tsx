"use client";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";

export default function GuestView() {
  return (
    <div className="w-full py-20 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-semibold text-green-600 mb-6">
        Welcome to HSL Bills
      </h1>
      <button
        onClick={() => signIn("google")}
        className="flex items-center gap-3 bg-white border border-gray-300 py-3 px-5 rounded-lg shadow hover:bg-gray-100 transition font-medium cursor-pointer"
      >
        <FcGoogle className="w-6 h-6" />
        Continue with Google
      </button>
      <p className="mt-3 text-green-400">Signed in to Show Bills and Add New Bills</p>
      <p className="mt-1 text-sm text-gray-300">
        Viewer can only see the list of Bills
      </p>
      <p className="mt-1 text-sm text-gray-300">
        Editor can add new Bills and update existing Bills
      </p>
    </div>
  );
}
