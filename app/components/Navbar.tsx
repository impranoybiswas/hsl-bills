"use client";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function Navbar() {
  const { data: session, status } = useSession();
  return (
    <nav className="h-15 w-full border-b border-green-800/50 shadow flex items-center justify-between px-4 md:px-8 lg:px-12 fixed bg-[#152111]">
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
            className="text-sm h-8 px-4 bg-red-600 hover:bg-red-700 text-white rounded-full font-medium transition shadow-sm cursor-pointer flex items-center gap-2"
          >
            Log out
          </button>
          <Image
            className="size-8 rounded-full object-cover shadow-sm border border-green-700"
            src={session?.user?.image || "/title.png"}
            alt="HSL Title"
            width={100}
            height={100}
          />
        </div>
      )}
 
    </nav>
  );
}
