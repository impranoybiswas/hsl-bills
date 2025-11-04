"use client";

import { useState, useMemo } from "react";
import { useBills } from "../hooks/useBills";
import { useCustomers } from "../hooks/useCustomers";
import AddBill from "./AddBill";
import { format } from "date-fns";
import { GoCheckCircleFill } from "react-icons/go";
import { MdRadioButtonChecked } from "react-icons/md";
import EditBill from "./EditBill";

export default function BillsTable({userRole}: {userRole: string}) {
  const [status, setStatus] = useState("");
  const [customer, setCustomer] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const {
    data: bills = [],
    isLoading,
    isError,
    refetch,
  } = useBills({ status, customer, sortOrder });

  const { data: customers } = useCustomers();

  const uniqueCustomers = useMemo(() => {
    if (!customers) return [];
    const names = customers.map((c) => c.name);
    return Array.from(new Set(names));
  }, [customers]);

  const totalPaid = useMemo(
    () =>
      bills
        .filter((b) => b.status === "paid")
        .reduce((sum, b) => sum + b.amount, 0),
    [bills]
  );

  const totalPending = useMemo(
    () =>
      bills
        .filter((b) => b.status === "pending")
        .reduce((sum, b) => sum + b.amount, 0),
    [bills]
  );

  return (
    <section className="bg-white h-[calc(100vh-120px)]">
      {/* ===== Header Filters Section ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-4 bg-green-600 px-4 md:px-8 lg:px-10 py-2 text-white text-sm shadow">
        
        {/* States */}
        <div className="grid grid-cols-3 gap-2 md:gap-4">
         
          <div className="flex flex-col lg:flex-row items-center select gap-2">
            <div className="flex items-center gap-2"><span className="size-3 rounded-full bg-sky-400 shadow" />Total Bills</div>
            <strong>{bills.length}</strong>
          </div>

          <div className="flex flex-col lg:flex-row items-center select gap-2">
            <div className="flex items-center gap-2"><span className="size-3 rounded-full bg-green-400 shadow" />Paid</div>
            <strong>৳{totalPaid.toLocaleString()}</strong>
          </div>

          <div className="flex flex-col lg:flex-row items-center select gap-2">
            <div className="flex items-center gap-2"><span className="size-3 rounded-full bg-orange-400 shadow" />Pending</div>
            <strong>৳{totalPending.toLocaleString()}</strong>
          </div>

        </div>
        {/* Filters */}
        <div className="grid grid-cols-3 gap-2 md:gap-4 text-sm">
          
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="select"
          >
            
            <option value="">Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
          <select
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            className="select"
          >
            
            <option value="">Customers</option>
            {uniqueCustomers.map((name) => (
              <option key={name} value={name}>
                
                {name}
              </option>
            ))}
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
            className="select"
          >
            
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {/* ===== Table Section ===== */}
      <div className="w-full h-full overflow-y-scroll overflow-x-auto">
        <table className="min-w-full whitespace-nowrap">
          <thead className="sticky top-0">
            <tr>
              <th>Invoice</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Quantity</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Paid At</th>
              <th>Method</th>
              <th>Actions</th>
            </tr>
          </thead>

          {isLoading ? (
            <tbody>
              <tr>
                <td colSpan={8}>
                  <p className="text-center text-gray-900 mt-6">
                    Loading bills...
                  </p>
                </td>
              </tr>
            </tbody>
          ) : isError ? (
            <tbody>
              <tr>
                <td colSpan={8}>
                  <p className="text-center text-gray-600 mt-6">
                    Failed to load bills.
                  </p>
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody className="text-gray-900">
              {bills.map((bill) => (
                <tr
                  key={bill._id}
                  className="odd:bg-white even:bg-gray-50 hover:bg-green-50 text-sm"
                >
                  <td className="px-4 py-2">{bill.invoice}</td>
                  <td className="px-4 py-2 text-center">
                    {format(bill.date, "dd MMM yyyy")}
                  </td>
                  <td className="px-4 py-2">{bill.customer}</td>
                  <td className="px-4 py-2 capitalize text-center">{bill.quantity}</td>
                  <td className="px-4 py-2 text-right font-semibold">
                    {bill.amount.toLocaleString()}
                  </td>
                  <td>
                    {bill.status === "paid" ? (
                      <span className="flex items-center gap-2 text-green-600">
                        <GoCheckCircleFill /> PAID
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-orange-600">
                        <MdRadioButtonChecked /> PENDING
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {bill.status === "paid"
                      ? format(bill.paidAt || new Date(), "dd MMM yyyy")
                      : "—"}
                  </td>
                  <td className="px-4 py-2 uppercase text-center">
                    {bill.method || "—"}
                  </td>
                  <td
                    className="py-2  "
                  >
                    <EditBill userRole={userRole} bill={bill} refetch={refetch} />
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>


      {/* ===== Floating Add Button ===== */}
      <div className="fixed bottom-10 right-10">
        <AddBill userRole={userRole} />
      </div>
    </section>
  );
}
