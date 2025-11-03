"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useCustomers } from "../hooks/useCustomers";
import axiosSecure from "../libs/axiosSecure";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { ToWords } from "to-words";
import QRCode from "qrcode";

export default function AddBill() {
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

  // ToWords instance for currency in words
  const toWords = new ToWords({
    localeCode: "en-IN",
    converterOptions: {
      currency: true,
      ignoreDecimal: false,
      currencyOptions: {
        name: "Taka",
        plural: "Taka",
        symbol: "৳",
        fractionalUnit: { name: "Paisa", plural: "Paisa", symbol: "৳" },
      },
    },
  });

  // Generate professional PDF invoice
  const generatePDF = async ({
    invoice,
    date,
    selectedCustomer,
    quantity,
    expiryDate,
  }: pdfBill) => {
    const doc = new jsPDF();
    const total = selectedCustomer.price * quantity;
    const totalFormatted = total.toLocaleString("en-US");
    const totalInWords = toWords.convert(total);
    const unitPrice = selectedCustomer.price.toLocaleString("en-US");

    const infoStartY = 55;
    const infoStartX = 14;
    const infoStartX2 = 42;

    // Centered Header Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("SALES INVOICE", 105, infoStartY, { align: "center" });

    // Invoice + Date line
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Invoice No`, infoStartX, infoStartY + 16);
    doc.setFont("levetica", "normal");
    doc.text(`${":  " + invoice}`, infoStartX2, infoStartY + 16);

    doc.setFont("helvetica", "bold");
    doc.text(`Date`, infoStartX, infoStartY + 22);
    doc.setFont("levetica", "normal");
    doc.text(
      `${":  " + format(new Date(date), "dd MMM yyyy")}`,
      infoStartX2,
      infoStartY + 22
    );

    // Customer Info
    doc.setFont("helvetica", "bold");
    doc.text(`Customer ID`, infoStartX, infoStartY + 28);
    doc.setFont("levetica", "normal");
    doc.text(
      `${":  " + selectedCustomer.customerId || "N/A"}`,
      infoStartX2,
      infoStartY + 28
    );

    doc.setFont("helvetica", "bold");
    doc.text(`Customer`, infoStartX, infoStartY + 34);
    doc.setFont("levetica", "normal");
    doc.text(`${":  " + selectedCustomer.name}`, infoStartX2, infoStartY + 34);

    doc.setFont("helvetica", "bold");
    doc.text(`Address`, infoStartX, infoStartY + 40);
    doc.setFont("levetica", "normal");
    doc.text(
      `${":  " + selectedCustomer.address || "Not provided"}`,
      infoStartX2,
      infoStartY + 40
    );

    // Table Section
    autoTable(doc, {
      startY: infoStartY + 55,
      head: [
        [
          "Product",
          "Quantity",
          {
            content: "Unit Price (BDT)",
            styles: { halign: "right", cellWidth: 40 },
          },
          {
            content: "Amount (BDT)",
            styles: { halign: "right", cellWidth: 40 },
          },
        ],
      ],
      body: [
        [selectedCustomer.product, quantity, unitPrice, totalFormatted],
        ["", "", "", ""],
        ["", "", "", ""],
        ["", "", "", ""],
        ["", "", "", ""],
        ["", "", "", ""],
        ["", "", "", ""],
        ["", "", "", ""],
        ["", "", "", ""],
        ["", "", "", ""],
        ["", "", "", ""],
        [
          { content: `In Word : ${totalInWords}`, colSpan: 2 },
          {
            content: "Total (BDT)",
            styles: { halign: "right", cellWidth: 20, fontStyle: "bold" },
          },
          totalFormatted,
        ],
      ],
      styles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        fontSize: 11,
        lineWidth: 0.1,
      },

      headStyles: {
        fontStyle: "bold",
      },

      columnStyles: {
        0: { halign: "left" },
        1: { halign: "center", cellWidth: 20 },
        2: { halign: "right", cellWidth: 40 },
        3: { halign: "right", cellWidth: 40 },
      },
    });

    // Prepare plain text (not JSON) for QR and display
    const qrText = `HEALTHCARE SOLUTIONS LTD

Invoice: ${invoice}
Date: ${format(new Date(date), "dd MMM yyyy")}
Customer: ${selectedCustomer.name}
Product: ${selectedCustomer.product}
Quantity: ${quantity}
UnitPrice: ৳${unitPrice}
Total: ৳${totalFormatted}`;

    // Generate QR (base64 PNG)
    const qrDataUrl = await QRCode.toDataURL(qrText, {
      errorCorrectionLevel: "H",
    });

    // Place QR under the table, centered

    doc.addImage(qrDataUrl, "PNG", 166, infoStartY + 11, 30, 30);

    doc.setFont("helvetica", "normal");
    doc.text(`________________________`, 14, 272);
    doc.text(`Authorized Signature`, 22, 278);

    doc.text(`________________________`, 80, 272);
    doc.text(`Store-in-Charge`, 93, 278);

    doc.text(`________________________`, 145, 272);
    doc.text(`Received By`, 160, 278);

    //Delivery Challan
    if (!selectedCustomer.isMonthly) {
      doc.addPage();

      // Centered Header Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("DELIVERY CHALLAN", 105, infoStartY, { align: "center" });

      // Invoice + Date line
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`Invoice No`, infoStartX, infoStartY + 16);
      doc.setFont("levetica", "normal");
      doc.text(`${":  " + invoice}`, infoStartX2, infoStartY + 16);

      doc.setFont("helvetica", "bold");
      doc.text(`Date`, infoStartX, infoStartY + 22);
      doc.setFont("levetica", "normal");
      doc.text(
        `${":  " + format(new Date(date), "dd MMM yyyy")}`,
        infoStartX2,
        infoStartY + 22
      );

      // Customer Info
      doc.setFont("helvetica", "bold");
      doc.text(`Customer ID`, infoStartX, infoStartY + 28);
      doc.setFont("levetica", "normal");
      doc.text(
        `${":  " + selectedCustomer.customerId || "N/A"}`,
        infoStartX2,
        infoStartY + 28
      );

      doc.setFont("helvetica", "bold");
      doc.text(`Customer`, infoStartX, infoStartY + 34);
      doc.setFont("levetica", "normal");
      doc.text(
        `${":  " + selectedCustomer.name}`,
        infoStartX2,
        infoStartY + 34
      );

      doc.setFont("helvetica", "bold");
      doc.text(`Address`, infoStartX, infoStartY + 40);
      doc.setFont("levetica", "normal");
      doc.text(
        `${":  " + selectedCustomer.address || "Not provided"}`,
        infoStartX2,
        infoStartY + 40
      );

      // Table Section
      autoTable(doc, {
        startY: infoStartY + 55,
        head: [["Name of the Product", "Quantity", "Date of Expiry"]],
        body: [
          [selectedCustomer.product, quantity, expiryDate],
          ["", "", ""],
          ["", "", ""],
          ["", "", ""],
          ["", "", ""],
          ["", "", ""],
          ["", "", ""],
          ["", "", ""],
          ["", "", ""],
          ["", "", ""],
          ["", "", ""],
          ["", "", ""],
        ],
        styles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          lineColor: [0, 0, 0],
          fontSize: 11,
          lineWidth: 0.1,
        },

        headStyles: {
          fontStyle: "bold",
          halign: "center",
        },

        columnStyles: {
          0: { halign: "left" },
          1: { halign: "center", cellWidth: 25 },
          2: { halign: "center", cellWidth: 50 },
        },
      });

      doc.setFont("helvetica", "normal");
      doc.text(`________________________`, 14, 272);
      doc.text(`Authorized Signature`, 22, 278);

      doc.text(`________________________`, 80, 272);
      doc.text(`Store-in-Charge`, 93, 278);

      doc.text(`________________________`, 145, 272);
      doc.text(`Received By`, 160, 278);
    }

    // Save PDF
    doc.save(`Invoice_${invoice}.pdf`);
  };

  // Handle Bill Creation
  const handleAddBill = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomer) {
      alert("Please select a customer first.");
      return;
    }

    try {
      const response = await axiosSecure.post("/api/bills", {
        customer: selectedCustomer.name,
        quantity,
        amount: selectedCustomer.price * quantity,
      });

      alert(`Bill added successfully! Invoice: ${response.data.invoice}`);

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
      alert("Failed to add bill. Check console for details.");
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
      >
        ADD BILL
      </button>

      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-100"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg"
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
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Add Bill
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
