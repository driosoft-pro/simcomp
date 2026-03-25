import ExcelJS from "exceljs";

export async function buildExcelSingleSheet(sheetName, rows) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  if (rows.length > 0) {
    const headers = Object.keys(rows[0]);
    worksheet.columns = headers.map((header) => ({
      header,
      key: header,
      width: 22
    }));

    rows.forEach((row) => worksheet.addRow(row));

    worksheet.getRow(1).font = { bold: true };
  } else {
    worksheet.addRow(["Sin datos"]);
  }

  return workbook.xlsx.writeBuffer();
}

export async function buildExcelDataset(dataset) {
  const workbook = new ExcelJS.Workbook();

  for (const [sheetName, rows] of Object.entries(dataset)) {
    const worksheet = workbook.addWorksheet(sheetName);

    if (rows.length > 0) {
      const headers = Object.keys(rows[0]);
      worksheet.columns = headers.map((header) => ({
        header,
        key: header,
        width: 22
      }));
      rows.forEach((row) => worksheet.addRow(row));
      worksheet.getRow(1).font = { bold: true };
    } else {
      worksheet.addRow(["Sin datos"]);
    }
  }

  return workbook.xlsx.writeBuffer();
}