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
import { BsEye } from "react-icons/bs";
import { HiEye, HiEyeOff } from "react-icons/hi";

export default function BillsTable({ userRole }: { userRole: string }) {
  const [showStates, setShowStates] = useState(true);
  const [status, setStatus] = useState("");
  const [customer, setCustomer] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const limit = 50;

  const { data, isLoading, isError, refetch } = useBills({
    status,
    customer,
    sortOrder,
    page,
    limit,
  });

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
    <section className="w-full h-dvh flex-1 flex flex-col gap-5 pb-5 pt-19 px-4 md:px-6 lg:px-10">

      <button onClick={() => setShowStates(!showStates)} className="size-8 rounded-full bg-green-700 text-white font-medium transition shadow-sm cursor-pointer flex items-center justify-center gap-2 absolute top-3 right-36 md:right-40 lg:right-44 z-10">{showStates ? <HiEyeOff/> : <HiEye />}</button>
      {/* ===== States ==== */}
      <div className={`grid-cols-8 gap-2 md:gap-3 lg:gap-5 w-full ${showStates ? "grid" : "hidden"} transition-all duration-500 ease-in-out`}>
        <StateCard
          title="Bills"
          value={totalBills.toString()}
          color="text-blue-500"
          className="col-span-2"
        />
        <StateCard
          title="Paid"
          value={totalPaid.toLocaleString()}
          color="text-green-500"
          className="col-span-3"
        />
        <StateCard
          title="Pending"
          value={totalPending.toLocaleString()}
          color="text-orange-500"
          className="col-span-3"
        />
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
                  setCustomer(e.target.value.toLowerCase());
                  setPage(1);
                }}
              >
                <option value="">Customers</option>
                {uniqueCustomers.map((name) => (
                  <option key={name} value={name.toLowerCase()}>
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
                    className="odd:bg-white/6 even:bg-white/8 hover:bg-white/10 text-sm text-green-50/80"
                  >
                    <td className="px-4 py-2 text-center">{bill.invoice}</td>
                    <td className="px-4 py-2 text-center">
                      {bill.date && !isNaN(new Date(bill.date).getTime())
                        ? format(new Date(bill.date), "dd MMM yyyy")
                        : "—"}
                    </td>
                    <td className="px-4 py-2 capitalize">{bill.customer}</td>
                    <td className="px-4 py-2 capitalize text-center">
                      {bill.quantity}
                    </td>
                    <td className="px-4 py-2 text-right font-semibold">
                      {bill.amount.toLocaleString()}
                    </td>
                    <td>
                      {bill.status === "paid" ? (
                        <span className="flex items-center gap-2 bg-green-600 text-white rounded-full px-2 py-1 text-xs w-fit">
                          <GoCheckCircleFill /> PAID
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 bg-orange-600 text-white rounded-full px-2 py-1 text-xs w-fit">
                          <MdRadioButtonChecked /> PENDING
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {bill.status === "paid" &&
                      bill.paidAt &&
                      !isNaN(new Date(bill.paidAt).getTime())
                        ? format(new Date(bill.paidAt), "dd MMM yyyy")
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
              onClick={() =>
                setPage((prev) => Math.min(prev + 1, pagination.totalPages))
              }
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

const StateCard = ({
  title,
  value,
  color,
  className,
}: {
  title: string;
  value: string;
  color: string;
  className: string;
}) => {
  return (
    <div className={`card p-2 md:p-4 ${className}`}>
      <span className="text-white text-xs md:text-sm">
        <span className="hidden md:inline-block pr-1">Total</span>
        {title}
      </span>
      <strong
        className={`${color} font-bold text-lg md:text-2xl lg:text-3xl block`}
      >
        {value}
      </strong>
    </div>
  );
};
