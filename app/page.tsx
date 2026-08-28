"use client";

import { useSession } from "next-auth/react";
import BillsTable from "./components/BillTable";

import { TbLoader2 } from "react-icons/tb";
import GuestView from "./components/GuestView";
import Navbar from "./components/Navbar";

export default function Home() {
  const { data: session, status } = useSession();
  const userRole = session?.user?.role || "viewer";
  const userEmail = session?.user?.email || "";
  return (
    <main className="w-full h-dvh flex flex-col">
      <Navbar />
      {status === "loading" && (
        <div className="w-full h-100 flex items-center justify-center">
          <TbLoader2 size={70} className="animate-spin text-green-700" />
        </div>
      )}
      {status === "unauthenticated" && <GuestView />}
      {status === "authenticated" && <BillsTable userRole={userRole} />}
    </main>
  );
}
