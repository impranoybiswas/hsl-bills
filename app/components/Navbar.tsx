"use client";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function Navbar() {
  const { data: session, status } = useSession();
  return (
    <nav className="h-14 bg-lime-50 w-full shadow-sm flex items-center justify-between px-4 md:px-8 lg:px-10">
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
        <div className="flex items-center gap-4">
          <button
            onClick={() => signOut()}
            className="text-sm h-8 px-3 bg-red-500 hover:bg-red-600 text-white rounded font-medium transition shadow-sm cursor-pointer"
          >
            Log out
          </button>
          <Image
            className="size-8 rounded-full object-cover shadow-sm"
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
