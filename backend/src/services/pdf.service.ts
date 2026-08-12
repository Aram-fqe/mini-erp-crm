import PDFDocument from 'pdfkit';

// ─── Types for PDF generation ───────────────
interface ChallanPdfData {
  challanNumber: string;
  status: string;
  createdAt: Date | string;
  totalQuantity: number;
  customer: {
    name: string;
    businessName?: string | null;
    mobile?: string | null;
    email?: string | null;
    gstNumber?: string | null;
  } | null;
  createdBy: {
    name: string;
    email?: string | null;
  } | null;
  items: Array<{
    productSku: string;
    productName: string;
    unitPrice: number | { toNumber?: () => number };
    quantity: number;
  }>;
}

// ─── Color Palette (matching the app theme) ──
const COLORS = {
  primary: '#6c63ff',
  primaryDark: '#5a52e0',
  dark: '#0f1117',
  cardBg: '#1a1d27',
  text: '#e8eaed',
  muted: '#9aa0ac',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  white: '#ffffff',
  black: '#000000',
  tableBorder: '#2a2e3a',
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'CONFIRMED': return COLORS.success;
    case 'DRAFT': return COLORS.warning;
    case 'CANCELLED': return COLORS.danger;
    default: return COLORS.muted;
  }
};

/**
 * Generates a professional invoice-style PDF for a delivery challan.
 * Returns a PDFKit document stream that can be piped to a response.
 */
export const generateChallanPdf = (challan: ChallanPdfData): PDFKit.PDFDocument => {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    info: {
      Title: `Invoice - ${challan.challanNumber}`,
      Author: 'Mini ERP + CRM',
      Subject: `Delivery Challan ${challan.challanNumber}`,
    },
  });

  const pageWidth = doc.page.width;
  const contentWidth = pageWidth - 100; // 50px margin on each side
  const leftMargin = 50;

  // ─── Header Section ───────────────────────
  // Company name
  doc
    .fontSize(22)
    .font('Helvetica-Bold')
    .fillColor(COLORS.primary)
    .text('Mini ERP + CRM', leftMargin, 40);

  doc
    .fontSize(8)
    .font('Helvetica')
    .fillColor(COLORS.muted)
    .text('Operations Portal — Delivery Challan / Invoice', leftMargin, 65);

  // Challan number & status (right-aligned)
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .fillColor(COLORS.black)
    .text(challan.challanNumber, leftMargin, 40, { align: 'right', width: contentWidth });

  const statusColor = getStatusColor(challan.status);
  doc
    .fontSize(9)
    .font('Helvetica-Bold')
    .fillColor(statusColor)
    .text(challan.status, leftMargin, 57, { align: 'right', width: contentWidth });

  // Horizontal rule
  doc
    .moveTo(leftMargin, 85)
    .lineTo(leftMargin + contentWidth, 85)
    .strokeColor(COLORS.tableBorder)
    .lineWidth(1)
    .stroke();

  // ─── Date & Created By ────────────────────
  const dateStr = new Date(challan.createdAt).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  let yPos = 100;

  doc
    .fontSize(8)
    .font('Helvetica')
    .fillColor(COLORS.muted)
    .text('Date Issued:', leftMargin, yPos);

  doc
    .fontSize(9)
    .font('Helvetica-Bold')
    .fillColor(COLORS.black)
    .text(dateStr, leftMargin + 70, yPos);

  doc
    .fontSize(8)
    .font('Helvetica')
    .fillColor(COLORS.muted)
    .text('Issued By:', leftMargin + 300, yPos);

  doc
    .fontSize(9)
    .font('Helvetica-Bold')
    .fillColor(COLORS.black)
    .text(challan.createdBy?.name || 'System User', leftMargin + 355, yPos);

  // ─── Customer Details ─────────────────────
  yPos = 135;

  doc
    .roundedRect(leftMargin, yPos, contentWidth, 75, 4)
    .fillColor('#f8f9fa')
    .fill();

  yPos += 12;

  doc
    .fontSize(9)
    .font('Helvetica-Bold')
    .fillColor(COLORS.primary)
    .text('BILL TO', leftMargin + 15, yPos);

  yPos += 16;

  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .fillColor(COLORS.black)
    .text(challan.customer?.name || 'N/A', leftMargin + 15, yPos);

  if (challan.customer?.businessName) {
    yPos += 14;
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor(COLORS.muted)
      .text(challan.customer.businessName, leftMargin + 15, yPos);
  }

  yPos += 14;
  const contactParts: string[] = [];
  if (challan.customer?.mobile) contactParts.push(`Mobile: ${challan.customer.mobile}`);
  if (challan.customer?.email) contactParts.push(`Email: ${challan.customer.email}`);
  if (challan.customer?.gstNumber) contactParts.push(`GST: ${challan.customer.gstNumber}`);

  if (contactParts.length > 0) {
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor(COLORS.muted)
      .text(contactParts.join('   |   '), leftMargin + 15, yPos);
  }

  // ─── Line Items Table ─────────────────────
  yPos = 235;

  // Table Header
  const colWidths = {
    sno: 30,
    sku: 80,
    name: 170,
    price: 80,
    qty: 60,
    total: contentWidth - 30 - 80 - 170 - 80 - 60,
  };

  const drawTableHeader = (y: number) => {
    doc
      .rect(leftMargin, y, contentWidth, 22)
      .fillColor(COLORS.primary)
      .fill();

    const headerY = y + 7;
    doc.fontSize(7).font('Helvetica-Bold').fillColor(COLORS.white);

    let xPos = leftMargin + 8;
    doc.text('#', xPos, headerY, { width: colWidths.sno });
    xPos += colWidths.sno;
    doc.text('SKU', xPos, headerY, { width: colWidths.sku });
    xPos += colWidths.sku;
    doc.text('PRODUCT NAME', xPos, headerY, { width: colWidths.name });
    xPos += colWidths.name;
    doc.text('UNIT PRICE', xPos, headerY, { width: colWidths.price, align: 'right' });
    xPos += colWidths.price;
    doc.text('QTY', xPos, headerY, { width: colWidths.qty, align: 'center' });
    xPos += colWidths.qty;
    doc.text('LINE TOTAL', xPos, headerY, { width: colWidths.total, align: 'right' });

    return y + 22;
  };

  yPos = drawTableHeader(yPos);

  // Table Rows
  let grandTotal = 0;

  challan.items.forEach((item, index) => {
    const unitPrice = typeof item.unitPrice === 'object' && item.unitPrice?.toNumber
      ? item.unitPrice.toNumber()
      : Number(item.unitPrice);
    const lineTotal = unitPrice * item.quantity;
    grandTotal += lineTotal;

    const rowBg = index % 2 === 0 ? '#ffffff' : '#f8f9fa';
    doc.rect(leftMargin, yPos, contentWidth, 20).fillColor(rowBg).fill();

    const rowY = yPos + 6;
    doc.fontSize(7).font('Helvetica').fillColor(COLORS.black);

    let xPos = leftMargin + 8;
    doc.text(String(index + 1), xPos, rowY, { width: colWidths.sno });
    xPos += colWidths.sno;

    doc.font('Helvetica-Bold').fillColor(COLORS.primary);
    doc.text(item.productSku, xPos, rowY, { width: colWidths.sku });
    xPos += colWidths.sku;

    doc.font('Helvetica').fillColor(COLORS.black);
    doc.text(item.productName, xPos, rowY, { width: colWidths.name });
    xPos += colWidths.name;

    doc.text(`₹${unitPrice.toFixed(2)}`, xPos, rowY, { width: colWidths.price, align: 'right' });
    xPos += colWidths.price;

    doc.font('Helvetica-Bold');
    doc.text(String(item.quantity), xPos, rowY, { width: colWidths.qty, align: 'center' });
    xPos += colWidths.qty;

    doc.fillColor(COLORS.success);
    doc.text(`₹${lineTotal.toFixed(2)}`, xPos, rowY, { width: colWidths.total, align: 'right' });

    yPos += 20;
  });

  // Bottom border of table
  doc
    .moveTo(leftMargin, yPos)
    .lineTo(leftMargin + contentWidth, yPos)
    .strokeColor(COLORS.tableBorder)
    .lineWidth(1)
    .stroke();

  // ─── Totals Row ───────────────────────────
  yPos += 8;

  doc
    .rect(leftMargin + contentWidth - 200, yPos, 200, 28)
    .fillColor(COLORS.primary)
    .fill();

  doc
    .fontSize(9)
    .font('Helvetica-Bold')
    .fillColor(COLORS.white)
    .text('GRAND TOTAL', leftMargin + contentWidth - 190, yPos + 8, { width: 100 });

  doc
    .fontSize(11)
    .font('Helvetica-Bold')
    .fillColor(COLORS.white)
    .text(`₹${grandTotal.toFixed(2)}`, leftMargin + contentWidth - 90, yPos + 7, {
      width: 80,
      align: 'right',
    });

  // Total quantity
  yPos += 38;
  doc
    .fontSize(8)
    .font('Helvetica')
    .fillColor(COLORS.muted)
    .text(`Total Dispatched Quantity: ${challan.totalQuantity} units`, leftMargin, yPos, {
      align: 'right',
      width: contentWidth,
    });

  // ─── Footer ───────────────────────────────
  const footerY = doc.page.height - 60;

  doc
    .moveTo(leftMargin, footerY)
    .lineTo(leftMargin + contentWidth, footerY)
    .strokeColor(COLORS.tableBorder)
    .lineWidth(0.5)
    .stroke();

  doc
    .fontSize(7)
    .font('Helvetica')
    .fillColor(COLORS.muted)
    .text(
      `Generated by Mini ERP + CRM on ${new Date().toLocaleString('en-IN')}`,
      leftMargin,
      footerY + 8,
      { width: contentWidth, align: 'center' }
    );

  doc
    .fontSize(7)
    .text(
      'This is a computer-generated document. No signature is required.',
      leftMargin,
      footerY + 20,
      { width: contentWidth, align: 'center' }
    );

  doc.end();
  return doc;
};
