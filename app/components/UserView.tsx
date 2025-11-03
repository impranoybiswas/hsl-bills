"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";

export default function UserView() {
  const { data: session, status } = useSession();
  return (
    <div className="w-full py-20 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-semibold text-green-900 mb-6">
        Welcome to HSL Bills
      </h1>
      Hello {status === "loading" ? "User" : session?.user?.name}
      <p className="mt-3">
        Please Contact{" "}
        <Link
          href="https://impranoybiswas.vercel.app/"
          className="font-semibold text-blue-500 hover:text-blue-700"
        >
          Pranoy
        </Link>{" "}
        to update your role (Admin, Viewer, Editor)
      </p>
    </div>
  );
}
