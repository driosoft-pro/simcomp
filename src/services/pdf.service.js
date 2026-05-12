import PDFDocument from "pdfkit";

/**
 * Genera un reporte PDF con diseño mejorado, tablas y gráficos básicos.
 * Corregido: Alineación forzada al margen izquierdo para evitar desplazamientos.
 */
export function buildPdfReport(title, options = {}) {
  const isOldFormat = Array.isArray(options);
  const sections = isOldFormat ? options : (options.sections || []);
  const tables = isOldFormat ? [] : (options.tables || []);
  const charts = isOldFormat ? [] : (options.charts || []);

  const MARGIN = 50;
  const PAGE_WIDTH = 595.28; // A4 width
  const PAGE_HEIGHT = 841.89; // A4 height
  const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ 
      margin: MARGIN, 
      size: "A4",
      bufferPages: true 
    });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // --- ENCABEZADO (Solo primera página) ---
    const drawHeader = () => {
      doc.rect(0, 0, PAGE_WIDTH, 80).fill("#1e1b4b"); // Indigo-950
      doc.fillColor("#ffffff").fontSize(20).text("SIMCOMP", MARGIN, 25, { characterSpacing: 2 });
      doc.fontSize(10).fillColor("#a5b4fc").text("SISTEMA INTEGRAL DE GESTIÓN", MARGIN, 48);
      doc.fontSize(12).fillColor("#ffffff").text(title.toUpperCase(), MARGIN, 25, { align: "right", width: CONTENT_WIDTH });
      doc.moveDown(4);
    };

    drawHeader();

    // --- SECCIONES DE TEXTO ---
    sections.forEach((section) => {
      if (doc.y > PAGE_HEIGHT - 100) doc.addPage();
      
      doc.fillColor("#1e293b").fontSize(14).font("Helvetica-Bold").text(section.title);
      doc.rect(MARGIN, doc.y - 2, 40, 3).fill("#6366f1");
      doc.moveDown(0.8);

      if (Array.isArray(section.lines)) {
        section.lines.forEach((line) => {
          if (doc.y > PAGE_HEIGHT - 50) doc.addPage();
          doc.fillColor("#475569").fontSize(10).font("Helvetica").text(`• ${line}`, { 
            indent: 10,
            width: CONTENT_WIDTH,
            align: "justify"
          });
        });
      }
      doc.moveDown(1.5);
    });

    // --- TABLAS MEJORADAS ---
    tables.forEach((table) => {
      if (doc.y > PAGE_HEIGHT - 150) doc.addPage();

      doc.fillColor("#1e293b").fontSize(14).font("Helvetica-Bold").text(table.title);
      doc.moveDown(0.8);

      const col1Width = CONTENT_WIDTH * 0.7;
      const col2Width = CONTENT_WIDTH * 0.3;
      const rowHeight = 25;

      // Header
      const headerY = doc.y;
      doc.rect(MARGIN, headerY, CONTENT_WIDTH, rowHeight).fill("#4338ca"); // Indigo-700
      doc.fillColor("#ffffff").fontSize(10).font("Helvetica-Bold");
      doc.text(table.headers[0].toUpperCase(), MARGIN + 10, headerY + 8, { width: col1Width - 20 });
      doc.text(table.headers[1].toUpperCase(), MARGIN + col1Width + 10, headerY + 8, { width: col2Width - 20, align: "right" });
      
      doc.y = headerY + rowHeight;

      // Rows
      table.rows.forEach((row, i) => {
        if (doc.y > PAGE_HEIGHT - 60) {
          doc.addPage();
          // Redraw header on new page for table continuity? Skip for simplicity now
        }
        
        const rowY = doc.y;
        if (i % 2 !== 0) {
          doc.rect(MARGIN, rowY, CONTENT_WIDTH, rowHeight).fill("#f8fafc");
        }
        
        // Borders
        doc.lineWidth(0.5).strokeColor("#e2e8f0")
           .moveTo(MARGIN, rowY + rowHeight)
           .lineTo(MARGIN + CONTENT_WIDTH, rowY + rowHeight)
           .stroke();

        doc.fillColor("#334155").fontSize(9).font("Helvetica");
        doc.text(String(row[0]), MARGIN + 10, rowY + 8, { width: col1Width - 20, lineBreak: false });
        doc.text(String(row[1]), MARGIN + col1Width + 10, rowY + 8, { width: col2Width - 20, align: "right" });
        
        doc.y = rowY + rowHeight;
      });

      doc.moveDown(2);
    });

    // --- GRÁFICOS ---
    charts.forEach((chart) => {
      if (doc.y > PAGE_HEIGHT - 250) doc.addPage();

      doc.fillColor("#1e293b").fontSize(14).font("Helvetica-Bold").text(chart.title);
      doc.moveDown(1.5);

      const chartHeight = 150;
      const chartWidth = CONTENT_WIDTH - 40;
      const startX = MARGIN + 30;
      const startY = doc.y;
      
      // Axes
      doc.lineWidth(1).strokeColor("#cbd5e1")
         .moveTo(startX, startY)
         .lineTo(startX, startY + chartHeight)
         .lineTo(startX + chartWidth, startY + chartHeight)
         .stroke();

      const maxVal = Math.max(...chart.data.map(d => d.value), 1);
      const barGap = 20;
      const barWidth = (chartWidth - (chart.data.length + 1) * barGap) / chart.data.length;

      chart.data.forEach((item, i) => {
        const valH = (item.value / maxVal) * (chartHeight - 40);
        const x = startX + barGap + i * (barWidth + barGap);
        const y = startY + chartHeight - valH;

        // Bar with gradient-like effect (solid color + subtle border)
        doc.rect(x, y, barWidth, valH).fill(chart.color || "#4f46e5");
        
        // Value label
        doc.fillColor("#1e293b").fontSize(8).font("Helvetica-Bold")
           .text(String(item.value), x, y - 12, { width: barWidth, align: "center" });
        
        // Category label
        doc.fillColor("#64748b").fontSize(7).font("Helvetica")
           .text(item.label, x - 5, startY + chartHeight + 8, { width: barWidth + 10, align: "center" });
      });

      doc.y = startY + chartHeight + 40;
      doc.moveDown(2);
    });

    // --- PIE DE PÁGINA (En todas las páginas) ---
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).fillColor("#94a3b8").font("Helvetica").text(
        `SIMCOMP Analytics Engine | Página ${i + 1} de ${range.count} | ${new Date().toLocaleString()}`,
        MARGIN,
        PAGE_HEIGHT - 30,
        { align: "center", width: CONTENT_WIDTH }
      );
    }

    doc.end();
  });
}