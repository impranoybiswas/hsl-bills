"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useCustomers } from "../hooks/useCustomers";
import axiosSecure from "../libs/axiosSecure";
import { CiCirclePlus } from "react-icons/ci";
import toast from "react-hot-toast";
import { generatePDF } from "../libs/generatePDF";

export default function AddBill({ userRole }: { userRole: string }) {
  const [customerName, setCustomerName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [expiryDate, setExpiryDate] = useState("");
  const [isMonthly, setIsMonthly] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const { data: customers } = useCustomers();

  // Create unique customer list for dropdown
  const uniqueCustomers = useMemo(() => {
    if (!customers) return [];
    const names = customers.map((c) => c.name);
    return Array.from(new Set(names));
  }, [customers]);

  // Currently selected customer
  const selectedCustomer = useMemo(() => {
    if (!customers || !customerName) return null;
    return customers.find((c) => c.name === customerName) || null;
  }, [customers, customerName]);

  useEffect(() => {
    if (selectedCustomer) {
      setTimeout(() => {
        setIsMonthly(selectedCustomer.isMonthly);
        setQuantity(1);
      }, 0);
    }
  }, [selectedCustomer]);

  // Handle Bill Creation
  const handleAddBill = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomer) {
      toast.error("Please select a customer first.");
      return;
    }

    try {
      const response = await axiosSecure.post("/api/bills", {
        customer: selectedCustomer.name,
        quantity:selectedCustomer.isMonthly ? "monthly" : quantity,
        amount: selectedCustomer.price * quantity,
      });

      toast.success(
        `Bill added successfully! Invoice: ${response.data.invoice}`
      );

      generatePDF({
        invoice: response.data.invoice,
        date: new Date().toISOString(),
        selectedCustomer,
        quantity,
        expiryDate,
      });

      setShowModal(false);
      setCustomerName("");
      setQuantity(1);
      setExpiryDate("");
    } catch (error) {
      console.error("Error adding bill:", error);
      toast.error("Failed to add bill. Check console for details.");
    }
  };

  return (
    <div className="w-full h-full relative z-1000">
      <button
        onClick={() => setShowModal(true)}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition flex items-center
        gap-2 font-semibold cursor-pointer shadow-sm"
      >
        <CiCirclePlus size={22} /> ADD BILL 2
      </button>

      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          className="fixed inset-0 bg-black/70 flex justify-center items-center z-100"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white text-gray-900 rounded-lg p-6 w-full max-w-md shadow-lg"
          >
            <h2 className="text-lg font-semibold mb-4 text-center">
              Create New Bill
            </h2>

            <form onSubmit={handleAddBill} className="flex flex-col gap-4">
              <select
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="border px-3 py-2 rounded-md w-full"
              >
                <option value="">Select Customer</option>
                {uniqueCustomers.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>

              {!isMonthly && (
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="border px-3 py-2 rounded-md w-full"
                >
                  {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              )}
              <p className="text-sm text-center mt-3">Expiry Date</p>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="border px-3 py-2 rounded-md w-full"
              />

              {selectedCustomer && (
                <p className="text-gray-700 font-medium text-center">
                  Total Amount:{" "}
                  <span className="text-green-600 font-semibold">
                    ৳{selectedCustomer.price * quantity}
                  </span>
                </p>
              )}

              <button
                type="submit"
                disabled={userRole !== "editor"}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Add & Download
              </button>
            </form>
            {userRole !== "editor" && (
              <p className="mt-3 text-sm text-red-500 text-center">
                Only Editor can add new Bills
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
