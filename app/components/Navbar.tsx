"use client";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function Navbar() {
  const { data: session, status } = useSession();
  return (
    <nav className="h-[64px] w-full px-4 md:px-6 lg:px-10 border-b border-green-700/50 shadow flex items-center justify-between bg-black/30">
      <Image
        className="h-8 w-fit"
        src="/title.png"
        alt="HSL Title"
        width={100}
        height={100}
      />
      {status === "loading" && (
        <AiOutlineLoading3Quarters size={20} className="animate-spin" />
      )}
      {status === "authenticated" && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => signOut()}
            className="text-sm h-8 px-4 bg-red-700 hover:bg-red-800 text-white rounded-lg font-medium transition shadow-sm cursor-pointer flex items-center gap-2"
          >
            Log out
          </button>
          <div className="size-8 rounded-lg overflow-hidden shadow-sm border border-white/20 group">
            <Image
              className="object-cover w-full h-full"
              src={session?.user?.image || "/title.png"}
              alt="HSL Title"
              width={100}
              height={100}
            />
            <span className="text-white text-xs absolute bg-green-900 border border-green-600 rounded-lg px-2 py-1 top-15 right-6 group-hover:block hidden transition-all duration-500 ease-in-out text-center">
              You are logged in as <br /> {session?.user?.email} [
              {session?.user?.role}]
            </span>
          </div>
        </div>
      )}
    </nav>
  );
}
