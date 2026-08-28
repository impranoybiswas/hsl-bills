"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  TbLoader2,
  TbCircleCheckFilled,
  TbClockHour4Filled,
  TbFileInvoice,
  TbUser,
  TbCalendar,
  TbCurrencyTaka,
  TbPackage,
  TbCreditCard,
  TbAlertCircle,
} from "react-icons/tb";

type Bill = {
  _id: string;
  invoice: string;
  customer: string;
  quantity: number;
  amount: number;
  status: string;
  date: string;
  method: string;
  paidAt?: string;
};

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function DetailRow({
  icon,
  label,
  value,
  valueClass = "text-foreground",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-green-500/70 shrink-0">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <span className={`text-sm text-right ${valueClass}`}>{value}</span>
    </div>
  );
}

function VerifyContent() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");

  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!idParam) {
      setNotFound(true);
      return;
    }

    async function fetchBill() {
      setLoading(true);
      setNotFound(false);
      setBill(null);

      try {
        const res = await fetch(`/api/bills?limit=9999`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        const found = (data.bills as Bill[]).find((b) => b._id === idParam);
        if (found) {
          setBill(found);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    fetchBill();
  }, [idParam]);

  const isPaid = bill?.status === "paid";

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 mt-6">
        <TbLoader2 size={48} className="animate-spin text-green-600" />
        <p className="text-green-400/70 text-sm">Looking up invoice...</p>
      </div>
    );
  }

  /* ── Not Found ── */
  if (notFound) {
    return (
      <div className="w-full max-w-md rounded-xl border border-red-500/30 bg-red-950/20 p-8 flex flex-col items-center gap-3 text-center">
        <TbAlertCircle size={52} className="text-red-400" />
        <h2 className="text-xl font-bold text-red-300">Bill Not Found</h2>
        <p className="text-red-400/70 text-sm leading-relaxed">
          {idParam
            ? "No bill was found with the provided ID. The link may be invalid or the bill may have been removed."
            : "No bill ID was provided. Please use a valid verification link."}
        </p>
      </div>
    );
  }

  /* ── Bill Card ── */
  if (!bill) return null;

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-black/20 overflow-hidden shadow-2xl">
      {/* Status Banner */}
      <div
        className={`w-full flex items-center justify-center gap-3 py-6 ${
          isPaid
            ? "bg-green-900/40 border-b border-green-700/40"
            : "bg-yellow-900/20 border-b border-yellow-700/30"
        }`}
      >
        {isPaid ? (
          <>
            <TbCircleCheckFilled
              size={38}
              className="text-green-400 shrink-0"
            />
            <div>
              <p className="text-green-300 font-bold text-2xl">Paid</p>
              <p className="text-green-400/70 text-xs mt-0.5">
                Payment verified successfully
              </p>
            </div>
          </>
        ) : (
          <>
            <TbClockHour4Filled
              size={38}
              className="text-yellow-400 shrink-0"
            />
            <div>
              <p className="text-yellow-300 font-bold text-2xl">Pending</p>
              <p className="text-yellow-400/70 text-xs mt-0.5">
                Payment not yet received
              </p>
            </div>
          </>
        )}
      </div>

      {/* Invoice Number */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
        <span className="text-green-500/60 text-xs uppercase font-semibold tracking-wider">
          Invoice
        </span>
        <span className="font-mono text-foreground font-bold text-base tracking-wide">
          #{bill.invoice}
        </span>
      </div>

      {/* Details */}
      <div className="px-5 py-5 grid gap-4">
        <DetailRow
          icon={<TbUser size={17} className="text-green-500" />}
          label="Customer"
          value={bill.customer.charAt(0).toUpperCase() + bill.customer.slice(1)}
        />
        <DetailRow
          icon={<TbCurrencyTaka size={17} className="text-green-500" />}
          label="Amount"
          value={`৳ ${formatCurrency(bill.amount)}`}
          valueClass="font-bold text-green-300"
        />
        <DetailRow
          icon={<TbPackage size={17} className="text-green-500" />}
          label="Quantity"
          value={`${bill.quantity} unit${Number(bill.quantity) !== 1 ? "s" : ""}`}
        />
        <DetailRow
          icon={<TbCalendar size={17} className="text-green-500" />}
          label="Bill Date"
          value={formatDate(bill.date)}
        />
        {isPaid && bill.method && (
          <DetailRow
            icon={<TbCreditCard size={17} className="text-green-500" />}
            label="Payment Method"
            value={bill.method.charAt(0).toUpperCase() + bill.method.slice(1)}
          />
        )}
        {isPaid && bill.paidAt && (
          <DetailRow
            icon={<TbCalendar size={17} className="text-green-500" />}
            label="Paid On"
            value={formatDate(bill.paidAt)}
          />
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-primary/10 border-t border-border/40 text-center">
        <p className="text-green-600/50 text-xs">
          HSL Bills — Official Invoice Verification
        </p>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <main className="min-h-dvh bg-background flex flex-col items-center justify-start px-4 py-10">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/40 rounded-full px-4 py-1.5 mb-4">
          <TbFileInvoice size={15} className="text-green-400" />
          <span className="text-green-400 text-xs font-semibold tracking-widest uppercase">
            Invoice Verification
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
          Verify Your Bill
        </h1>
        <p className="text-green-400/60 mt-2 text-sm sm:text-base">
          Scan or open your bill link to check payment status
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center gap-2 text-green-400/70">
            <TbLoader2 size={20} className="animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        }
      >
        <VerifyContent />
      </Suspense>
    </main>
  );
}
