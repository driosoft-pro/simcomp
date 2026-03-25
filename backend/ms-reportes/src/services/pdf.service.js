import PDFDocument from "pdfkit";

export function buildPdfReport(title, sections = []) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(18).text(title, { align: "center" });
    doc.moveDown();

    sections.forEach((section) => {
      doc.fontSize(14).text(section.title, { underline: true });
      doc.moveDown(0.5);

      if (Array.isArray(section.lines)) {
        section.lines.forEach((line) => {
          doc.fontSize(11).text(`• ${line}`);
        });
      }

      doc.moveDown();
    });

    doc.end();
  });
}