"use client";

import { useState, useMemo } from "react";
import { useBills } from "../hooks/useBills";
import { useCustomers } from "../hooks/useCustomers";
import AddBill from "./AddBill";
import { format } from "date-fns";
import { GoCheckCircleFill } from "react-icons/go";
import { MdRadioButtonChecked } from "react-icons/md";
import UpdateBill from "./UpdateBill";
import { TbLoader2 } from "react-icons/tb";

export default function BillsTable({ userRole }: { userRole: string }) {
  const [status, setStatus] = useState("");
  const [customer, setCustomer] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const limit = 50;

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useBills({ status, customer, sortOrder, page, limit });

  const bills = data?.bills || [];
  const stats = data?.stats;
  const pagination = data?.pagination;

  const { data: customers } = useCustomers();

  const uniqueCustomers = useMemo(() => {
    if (!customers) return [];
    const names = customers.map((c) => c.name);
    return Array.from(new Set(names));
  }, [customers]);

  const totalPaid = stats?.totalPaid || 0;
  const totalPending = stats?.totalPending || 0;
  const totalBills = stats?.totalCount || 0;

  return (
    <section className="w-full h-dvh flex-1 px-4 md:px-8 lg:px-12 flex flex-col gap-5 pb-5 pt-20">
      {/* ===== States ==== */}

      <div className="grid grid-cols-8 gap-2 md:gap-3 lg:gap-5">
        <div className="card p-2 md:p-4 col-span-2">
          <span className="text-white text-xs md:text-sm">Total Bills</span>
          <strong className="text-blue-500 font-bold text-lg md:text-2xl lg:text-3xl">
            {totalBills}
          </strong>
        </div>

        <div className="card p-2 md:p-4 col-span-3">
          <span className="text-white text-xs md:text-sm">
            <span className="hidden md:inline-block">Total</span> Paid
          </span>
          <strong className="text-green-500 font-bold md:text-2xl lg:text-3xl">
            ৳{totalPaid.toLocaleString()}
          </strong>
        </div>

        <div className="card p-2 md:p-4 col-span-3">
          <span className="text-white text-xs md:text-sm">
            <span className="hidden md:inline-block">Total</span> Pending
          </span>
          <strong className="text-orange-500 font-bold md:text-2xl lg:text-3xl">
            ৳{totalPending.toLocaleString()}
          </strong>
        </div>
      </div>

      <div className="card flex flex-1 flex-col overflow-hidden">
        {/* ===== Filters ==== */}
        <div className="flex items-center justify-between gap-2 p-3">
          <div className="flex gap-2">
            <div className="dropCard">
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div className="dropCard">
              <select
                value={customer}
                onChange={(e) => {
                  setCustomer(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Customers</option>
                {uniqueCustomers.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="dropCard">
            <select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value as "asc" | "desc");
                setPage(1);
              }}
              className="select"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        {/* ===== Table ==== */}

        <div className="w-full h-full overflow-y-scroll overflow-x-auto">
          <table className="min-w-full whitespace-nowrap">
            <thead className="sticky -top-0.5">
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
                  <td colSpan={9}>
                    <div className="w-full h-50 flex items-center justify-center">
                      <TbLoader2
                        size={50}
                        className="animate-spin text-green-500"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            ) : isError ? (
              <tbody>
                <tr>
                  <td colSpan={9}>
                    <div className="w-full h-50 flex items-center justify-center text-green-500">
                      Failed to load bills.
                    </div>
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {bills.map((bill) => (
                  <tr
                    key={bill._id}
                    className="odd:bg-white/5 even:bg-white/8 hover:bg-white/20 text-sm text-green-50/80"
                  >
                    <td className="px-4 py-2 text-center">{bill.invoice}</td>
                    <td className="px-4 py-2 text-center">
                      {format(bill.date, "dd MMM yyyy")}
                    </td>
                    <td className="px-4 py-2">{bill.customer}</td>
                    <td className="px-4 py-2 capitalize text-center">
                      {bill.quantity}
                    </td>
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
                    <td className="py-2">
                      <UpdateBill
                        userRole={userRole}
                        bill={bill}
                        refetch={refetch}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>

        {/* ===== Pagination ==== */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 p-4 border-t border-white/10">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 rounded-lg text-white text-sm transition-colors"
            >
              Previous
            </button>
            <span className="text-white text-sm">
              Page {page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, pagination.totalPages))}
              disabled={page === pagination.totalPages}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 rounded-lg text-white text-sm transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {/* ===== Floating Add Button ===== */}
        <div className="fixed bottom-18 md:bottom-8 right-7 md:right-16">
          <AddBill userRole={userRole} />
        </div>
      </div>
    </section>
  );
}
