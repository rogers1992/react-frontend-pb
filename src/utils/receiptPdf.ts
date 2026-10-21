import jsPDF from "jspdf";
import type { Sale } from "../types";

// Helper: Format number with es-BO locale (e.g., 1.230,00)
const formatNumber = (num: number): string => {
  return num.toLocaleString("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Helper: Format date with es-BO locale (e.g., 02/10/2026, 15:26)
const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString("es-BO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Payment method labels (Spanish)
const paymentLabels: Record<string, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  tarjeta: "Tarjeta",
};

// Logo: Load JPG from /public/images/logo/logo_receipt.jpg
//        Remove orange background → white
//        Convert remaining pixels to grayscale
//        Return as PNG data URL
const prepareLogo = (): Promise<{
  data: string;
  width: number;
  height: number;
}> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Canvas context failed");

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Detect orange background (high R, medium G, low B)
        if (r > 150 && g < 150 && b < 100) {
          data[i] = 255;
          data[i + 1] = 255;
          data[i + 2] = 255;
        } else {
          const avg = (r + g + b) / 3;
          data[i] = avg;
          data[i + 1] = avg;
          data[i + 2] = avg;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      resolve({
        data: canvas.toDataURL("image/png"),
        width: img.width,
        height: img.height,
      });
    };
    img.onerror = (e) => {
      console.error("Logo load failed:", e);
      reject("Logo failed to load");
    };
    img.src = "/images/logo/logo_receipt.jpg";
  });
};

// Calculate required PDF height based on content
const calculateReceiptHeight = (sale: Sale): number => {
  let height = 10; // Starting margin + bottom margin

  // Logo (~25mm) + gap (4mm) + warehouse name (10mm) + gap (4mm)
  height += 43;

  // Header section (NOTA DE VENTA + dashed lines)
  height += 25;

  // Info section (Fecha, Vendedor, Cliente)
  height += 18;

  // Items header + dashed line
  height += 12;

  // Items: estimate 14mm per item (accounts for name wrapping)
  height += sale.items.length * 14;

  // Totals section (Subtotal + TOTAL)
  height += 20;

  // Payment section (Pago + Recibido)
  height += 20;

  // Footer (Gracias + Comprobante)
  height += 15;

  return Math.max(height, 150); // Minimum 150mm height
};

// Generate PDF receipt (80mm thermal printer format)
export async function generateReceiptPdf(
  sale: Sale,
  customerName: string,
  sellerName: string,
): Promise<void> {
  const pdfWidth = 80;
  const pdfHeight = calculateReceiptHeight(sale);
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [pdfWidth, pdfHeight],
  });

  let y = 5;
  const margin = 3;
  const centerX = pdfWidth / 2;
  const lineHeight = 4;

  // Draw dashed separator line
  const drawDashedLine = (yPos: number) => {
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.2);
    pdf.setLineDashPattern([1, 1], 0);
    pdf.line(margin, yPos, pdfWidth - margin, yPos);
    pdf.setLineDashPattern([], 0);
  };

  // Set font properties (size, bold, color)
  const setFont = (
    fontSize: number,
    bold: boolean,
    color: [number, number, number] = [0, 0, 0],
  ) => {
    pdf.setFontSize(fontSize);
    pdf.setFont("courier", bold ? "bold" : "normal");
    pdf.setTextColor(...color);
  };

  // Draw text that wraps to multiple lines if too long
  const drawWrappedText = (
    text: string,
    x: number,
    yPos: number,
    maxWidth: number,
    options: {
      align?: string;
      fontSize?: number;
      bold?: boolean;
      color?: [number, number, number];
    } = {},
  ): number => {
    const fontSize = options.fontSize || 10;
    const bold = options.bold || false;
    const color = options.color || [0, 0, 0];
    const align = (options.align as "left" | "center" | "right") || "left";

    setFont(fontSize, bold, color);

    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, yPos, { align });

    return lines.length * lineHeight;
  };

  // Draw single-line text
  const drawText = (
    text: string,
    x: number,
    yPos: number,
    options: {
      align?: string;
      fontSize?: number;
      bold?: boolean;
      color?: [number, number, number];
    } = {},
  ) => {
    const fontSize = options.fontSize || 10;
    const bold = options.bold || false;
    const color = options.color || [0, 0, 0];
    const align = (options.align as "left" | "center" | "right") || "left";

    setFont(fontSize, bold, color);
    pdf.text(text, x, yPos, { align });
  };

  // ── HEADER ─────────────────────────────────
  // Logo + warehouse name + sale number

  try {
    const logo = await prepareLogo();
    const logoWidth = 74;
    const logoHeight = (logo.height / logo.width) * logoWidth;
    pdf.addImage(
      logo.data,
      "PNG",
      (pdfWidth - logoWidth) / 2,
      y,
      logoWidth,
      logoHeight,
    );
    y += logoHeight + 4;
  } catch (err) {
    console.error("Logo preparation error:", err);
    drawText("PARAÍSO BIKER", centerX, y, {
      align: "center",
      fontSize: 14,
      bold: true,
    });
    y += 5;
  }

  // Warehouse name
  drawText(sale.warehouse_name || "Tienda Principal", centerX, y, {
    align: "center",
    fontSize: 10,
  });
  y += 4;

  drawDashedLine(y);
  y += 4;

  drawText(`NOTA DE VENTA #${sale.id}`, centerX, y, {
    align: "center",
    fontSize: 11,
    bold: true,
  });
  y += 4;

  drawDashedLine(y);
  y += 4;

  // ─── SALE INFO ──────────────────────────────
  // Date, seller, customer

  drawText("Fecha", margin, y, { fontSize: 10 });
  drawText(formatDate(sale.sale_date), pdfWidth - margin, y, {
    align: "right",
    fontSize: 10,
  });
  y += 4;
  drawText("Vendedor", margin, y, { fontSize: 10 });
  drawText(sellerName, pdfWidth - margin, y, { align: "right", fontSize: 10 });
  y += 4;
  drawText("Cliente", margin, y, { fontSize: 10 });
  drawText(customerName, pdfWidth - margin, y, {
    align: "right",
    fontSize: 10,
  });
  y += 6;

  drawDashedLine(y);
  y += 4;

  // ─── ITEMS ──────────────────────────────────
  // Product list with quantities and prices

  drawText("Cant", margin, y, { fontSize: 10, bold: true });
  drawText("Descripción", margin + 10, y, { fontSize: 10, bold: true });
  drawText("Total", pdfWidth - margin, y, {
    align: "right",
    fontSize: 10,
    bold: true,
  });
  y += 4;

  // Calculate totals
  const subtotal = sale.items.reduce((sum, item) => {
    const price =
      typeof item.unit_price === "string"
        ? parseFloat(item.unit_price)
        : item.unit_price;
    const discount =
      typeof item.discount === "string"
        ? parseFloat(item.discount)
        : item.discount;
    return sum + price * item.quantity - discount;
  }, 0);
  const total =
    typeof sale.total_amount === "string"
      ? parseFloat(sale.total_amount)
      : sale.total_amount;

  sale.items.forEach((item) => {
    const price =
      typeof item.unit_price === "string"
        ? parseFloat(item.unit_price)
        : item.unit_price;
    const totalPrice =
      typeof item.total_price === "string"
        ? parseFloat(item.total_price)
        : item.total_price;

    // Calculate max width for description (leave space for qty and total)
    const descMaxWidth = pdfWidth - margin - (margin + 10) - 15;

    drawText(item.quantity.toString(), margin, y, { fontSize: 10 });
    const descHeight = drawWrappedText(
      item.product_name,
      margin + 10,
      y,
      descMaxWidth,
      { fontSize: 10 },
    );
    drawText(formatNumber(totalPrice), pdfWidth - margin, y, {
      align: "right",
      fontSize: 10,
    });
    y += descHeight;

    drawText(`${item.quantity} x ${formatNumber(price)}`, margin + 10, y, {
      fontSize: 9,
      color: [85, 85, 85],
    });
    y += 4;
  });

  drawDashedLine(y);
  y += 4;

  // ─── TOTALS ─────────────────────────────────
  // Subtotal + total

  drawText("Subtotal", margin, y, { fontSize: 10 });
  drawText(`Bs ${formatNumber(subtotal)}`, pdfWidth - margin, y, {
    align: "right",
    fontSize: 10,
  });
  y += 4;
  drawText("TOTAL", margin, y, { fontSize: 12, bold: true });
  drawText(`Bs ${formatNumber(total)}`, pdfWidth - margin, y, {
    align: "right",
    fontSize: 12,
    bold: true,
  });
  y += 6;

  drawDashedLine(y);
  y += 4;

  // ─── PAYMENT ────────────────────────────────
  // Payment method + received amount

  drawText("Pago", margin, y, { fontSize: 10 });
  drawText(
    paymentLabels[sale.payment_method] ?? sale.payment_method,
    pdfWidth - margin,
    y,
    { align: "right", fontSize: 10 },
  );
  y += 4;
  drawText("Recibido", margin, y, { fontSize: 10 });
  drawText(`Bs ${formatNumber(total)}`, pdfWidth - margin, y, {
    align: "right",
    fontSize: 10,
  });
  y += 6;

  drawDashedLine(y);
  y += 4;

  // ─── FOOTER ────────────────────────────────
  // Thank you message + disclaimer

  drawText("¡Gracias por tu compra!", centerX, y, {
    align: "center",
    fontSize: 10,
    bold: true,
  });
  y += 4;
  const footerMaxWidth = pdfWidth - margin * 2;
  drawWrappedText(
    "Comprobante interno, no válido como factura.",
    centerX,
    y,
    footerMaxWidth,
    {
      align: "center",
      fontSize: 9,
      color: [85, 85, 85],
    },
  );

  pdf.save(`nota_venta_${sale.id}.pdf`);
}
