"use client";

import { useSession } from "next-auth/react";

import BillsTable from "./components/BillTable";

export default function Home() {
  return (
    <main className="w-full">
      <BillsTable />
    </main>
  );
}
