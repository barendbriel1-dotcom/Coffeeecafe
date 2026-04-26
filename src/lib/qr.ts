import QRCode from "qrcode";
import { jsPDF } from "jspdf";

export interface AssetQrLabel {
  id: string;
  assetId: string;
  name: string;
  code: string;
  serialNumber?: string | null;
}

const QR_SIZE = 320;

export function buildAssetQrPayload(assetId: string) {
  return assetId;
}

export async function generateAssetQrDataUrl(assetId: string) {
  return QRCode.toDataURL(buildAssetQrPayload(assetId), {
    width: QR_SIZE,
    margin: 2,
    color: {
      dark: "#00e676",
      light: "#10151c",
    },
  });
}

export function sanitizeQrFilePart(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "asset";
}

export function buildAssetQrFilename(label: Pick<AssetQrLabel, "code" | "name">, extension: "png" | "pdf") {
  return `${sanitizeQrFilePart(label.code || "asset")}-${sanitizeQrFilePart(label.name)}-qr.${extension}`;
}

export async function downloadAssetQrPng(label: AssetQrLabel) {
  const dataUrl = await generateAssetQrDataUrl(label.assetId);
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = buildAssetQrFilename(label, "png");
  anchor.click();
}

export async function exportAssetQrPdf(labels: AssetQrLabel[], fileName = "asset-qr-codes.pdf") {
  if (labels.length === 0) {
    throw new Error("No assets were selected for QR export.");
  }

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const columns = 3;
  const columnGap = 4;
  const rowGap = 6;
  const labelWidth = (pageWidth - margin * 2 - columnGap * (columns - 1)) / columns;
  const labelHeight = 72;
  const qrBoxSize = 34;
  const contentWidth = labelWidth - 8;
  const rowsPerPage = Math.max(1, Math.floor((pageHeight - margin * 2 + rowGap) / (labelHeight + rowGap)));

  const qrImages = await Promise.all(labels.map((label) => generateAssetQrDataUrl(label.assetId)));

  labels.forEach((label, index) => {
    if (index > 0 && index % (rowsPerPage * columns) === 0) {
      pdf.addPage();
    }

    const pageIndex = index % (rowsPerPage * columns);
    const row = Math.floor(pageIndex / columns);
    const column = pageIndex % columns;
    const x = margin + column * (labelWidth + columnGap);
    const y = margin + row * (labelHeight + rowGap);

    pdf.setDrawColor(28, 42, 34);
    pdf.setFillColor(19, 24, 31);
    pdf.roundedRect(x, y, labelWidth, labelHeight, 4, 4, "FD");

    pdf.addImage(qrImages[index], "PNG", x + (labelWidth - qrBoxSize) / 2, y + 5, qrBoxSize, qrBoxSize);

    pdf.setTextColor(0, 230, 118);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text(label.name, x + labelWidth / 2, y + 47, {
      align: "center",
      maxWidth: contentWidth,
    });

    pdf.setFont("courier", "bold");
    pdf.setFontSize(9);
    pdf.text(label.code, x + labelWidth / 2, y + 54, { align: "center" });

    if (label.serialNumber) {
      pdf.setFont("courier", "normal");
      pdf.setFontSize(7);
      pdf.setTextColor(170, 180, 191);
      pdf.text(label.serialNumber, x + labelWidth / 2, y + 60, {
        align: "center",
        maxWidth: contentWidth,
      });
    }
  });

  pdf.save(fileName);
}
