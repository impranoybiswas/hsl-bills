"use client";

import { useSession } from "next-auth/react";
import BillsTable from "./components/BillTable";

import { TbLoader2 } from "react-icons/tb";
import GuestView from "./components/GuestView";
import UserView from "./components/UserView";

export default function Home() {

  const { data: session, status } = useSession();
  const userRole = session?.user?.role || "user";
  return (
    <main className="w-full min-h-[calc(100vh-56px)] bg-white">
      {
        status === "loading" && (
          <div className="w-full h-100 flex items-center justify-center">
            <TbLoader2 size={70} className="animate-spin text-green-800" />
          </div>
        )
      }
      {
        status === "unauthenticated" && (
          <GuestView />
        )
      }
      {
        status === "authenticated" && userRole === "user" && (
          <UserView />
        )
      }
       {
        status === "authenticated" && (userRole === "viewer" || userRole === "editor") && (
          <BillsTable userRole={userRole} />
        )
      }
 
    </main>
  );
}
