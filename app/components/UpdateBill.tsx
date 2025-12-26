"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { FiEdit } from "react-icons/fi";
import axiosSecure from "../libs/axiosSecure";

export default function UpdateBill({
  bill,
  userRole,
  refetch,
}: {
  bill: Bill;
  userRole: string;
  refetch: () => void;
}) {
  const [showModal, setShowModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [method, setMethod] = useState("");

  const handleEditBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bill._id) return;

    if (!newStatus) {
      toast.error("Please select a new status.");
      return;
    }

    try {
      await axiosSecure.patch("/api/bills", {
        id: bill._id,
        status: newStatus,
        method,
      });

      toast.success("Bill updated successfully!");
      refetch();
      setShowModal(false);
    } catch (error) {
      console.error("❌ Error updating bill:", error);
      toast.error("Failed to update bill. Check console for details.");
    }
  };
  return (
    <div className="w-full h-full">
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center justify-center gap-2 cursor-pointer w-full h-full text-blue-600 hover:text-blue-800"
      >
        <FiEdit /> Update
      </button>

      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          className="fixed inset-0 bg-black/60 flex justify-center items-center z-10"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="modalCard"
          >
            <h2 className="text-xl font-semibold mb-4">
              Edit Bill : {bill.invoice}
            </h2>
            <form onSubmit={handleEditBill} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
              </div>

                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Payment Method
                </label>
                <select

                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  
                >
                  <option value="">Select Method</option>
                  <option value="cash">Cash</option>
                  <option value="online">Online</option>
                  <option value="check">Check</option>
                </select>


              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={userRole !== "editor" || method === ""}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
