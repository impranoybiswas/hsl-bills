import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ToWords } from "to-words";
import QRCode from "qrcode";

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

export const generatePDF = async ({
  invoice,
  date,
  selectedCustomer,
  quantity,
  expiryDate,
}: Invoice) => {
  const doc = new jsPDF();
  const total = selectedCustomer.price * quantity;
  const totalFormatted = total.toLocaleString("en-US");
  const totalInWords = toWords.convert(total);
  const unitPrice = selectedCustomer.price.toLocaleString("en-US");

  const infoStartY = 45;
  const infoStartX = 14;
  const infoStartX2 = 42;

  // Centered Header Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(1);
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
          styles: { halign: "right", cellWidth: 35 },
        },
        {
          content: "Amount (BDT)",
          styles: { halign: "right", cellWidth: 35 },
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
Total Amount: ৳${totalFormatted}`;

  // Generate QR (base64 PNG)
  const qrDataUrl = await QRCode.toDataURL(qrText, {
    errorCorrectionLevel: "H",
  });

  // Place QR under the table, centered

  doc.addImage(qrDataUrl, "PNG", 166, infoStartY + 11, 30, 30);

  doc.setFont("helvetica", "normal");
  doc.text(`________________________`, 14, 265);
  doc.text(`Authorized Signature`, 22, 272);

  doc.text(`________________________`, 80, 265);
  doc.text(`Store-in-Charge`, 93, 272);

  doc.text(`________________________`, 145, 265);
  doc.text(`Received By`, 160, 272);

  //copy sales
  doc.addPage();

  // Centered Header Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
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
          styles: { halign: "right", cellWidth: 35 },
        },
        {
          content: "Amount (BDT)",
          styles: { halign: "right", cellWidth: 35 },
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

  // Place QR under the table, centered

  doc.addImage(qrDataUrl, "PNG", 166, infoStartY + 11, 30, 30);

  doc.setFont("helvetica", "normal");
  doc.text(`________________________`, 14, 265);
  doc.text(`Authorized Signature`, 22, 272);

  doc.text(`________________________`, 80, 265);
  doc.text(`Store-in-Charge`, 93, 272);

  doc.text(`________________________`, 145, 265);
  doc.text(`Received By`, 160, 272);

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
    doc.text(`________________________`, 14, 265);
    doc.text(`Authorized Signature`, 22, 272);

    doc.text(`________________________`, 80, 265);
    doc.text(`Store-in-Charge`, 93, 272);

    doc.text(`________________________`, 145, 265);
    doc.text(`Received By`, 160, 272);
  }

  // Save PDF
  doc.save(`hsl-invoice-${invoice}.pdf`);
};
