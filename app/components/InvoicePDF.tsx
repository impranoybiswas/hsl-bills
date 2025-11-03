"use client";
import React, { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const InvoicePDF: React.FC = () => {
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    const input = pdfRef.current;
    if (!input) return;

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("invoice.pdf");
  };

  return (
    <div style={{ padding: "16px", backgroundColor: "#f5f5f5" }}>
      <div
        ref={pdfRef}
        style={{
          backgroundColor: "#ffffff",
          color: "#000000",
          padding: "40px",
          width: "210mm",
          minHeight: "297mm",
          margin: "0 auto",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "16px",
          }}
        >
          Invoice
        </h1>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "600" }}>From:</h2>
            <p>ABC Company</p>
            <p>Dhaka, Bangladesh</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "600" }}>To:</h2>
            <p>John Doe</p>
            <p>Customer Address</p>
          </div>
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #d1d5db",
            fontSize: "14px",
          }}
        >
          <thead style={{ backgroundColor: "#f3f4f6" }}>
            <tr>
              <th
                style={{
                  border: "1px solid #d1d5db",
                  paddingBottom: "4px",
                  textAlign: "left",
                  lineHeight: ".5",
                }}
              >
                Item
              </th>
              <th
                style={{
                  border: "1px solid #d1d5db",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                Qty
              </th>
              <th
                style={{
                  border: "1px solid #d1d5db",
                  padding: "8px",
                  textAlign: "right",
                }}
              >
                Price
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: "1px solid #d1d5db", padding: "8px" }}>
                Service A
              </td>
              <td
                style={{
                  border: "1px solid #d1d5db",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                2
              </td>
              <td
                style={{
                  border: "1px solid #d1d5db",
                  padding: "8px",
                  textAlign: "right",
                }}
              >
                1000
              </td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #d1d5db", padding: "8px" }}>
                Service B
              </td>
              <td
                style={{
                  border: "1px solid #d1d5db",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                1
              </td>
              <td
                style={{
                  border: "1px solid #d1d5db",
                  padding: "8px",
                  textAlign: "right",
                }}
              >
                1500
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginTop: "24px", textAlign: "right" }}>
          <p>Subtotal: 3500 BDT</p>
          <p>Tax (10%): 350 BDT</p>
          <p style={{ fontWeight: "bold", fontSize: "18px" }}>Total: 3850 BDT</p>
        </div>

        <div
          style={{
            marginTop: "40px",
            textAlign: "center",
            fontSize: "12px",
            color: "#6b7280",
          }}
        >
          <p>Thank you for your business!</p>
          <p>Generated on {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: "24px" }}>
        <button
          onClick={handleDownload}
          style={{
            padding: "8px 24px",
            backgroundColor: "#2563eb",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default InvoicePDF;
