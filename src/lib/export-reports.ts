import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportComplaintRow {
  complaintCode: string;
  citizenName: string;
  mobileNumber: string;
  areaStreet: string;
  wardNumber: string;
  category: string;
  status: string;
  assignedDepartment: string | null;
  description: string;
  latestUpdate: string | null;
  resolutionDetails: string | null;
  createdAt: string | Date;
}

export function exportComplaintsToExcel(rows: ExportComplaintRow[]) {
  const formatted = rows.map((r) => ({
    'Complaint ID': r.complaintCode,
    'Registered Date': new Date(r.createdAt).toLocaleString('en-IN'),
    'Citizen Name': r.citizenName,
    'Mobile Number': r.mobileNumber,
    'Area / Street': r.areaStreet,
    Ward: r.wardNumber,
    Category: r.category,
    Status: r.status,
    'Assigned Department': r.assignedDepartment || '-',
    Description: r.description,
    'Latest Update': r.latestUpdate || '-',
    'Resolution Details': r.resolutionDetails || '-',
  }));

  const worksheet = XLSX.utils.json_to_sheet(formatted);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Ward 65 Complaints');
  const dateStamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `HDMC-Ward65-Complaints-${dateStamp}.xlsx`);
}

export function exportComplaintsToPdf(rows: ExportComplaintRow[]) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  doc.setFontSize(14);
  doc.text('HDMC Ward No. 65, Hubballi — Civic Complaints Report', 40, 40);
  doc.setFontSize(9);
  doc.text(
    `Generated: ${new Date().toLocaleString('en-IN')} · Total Records: ${rows.length}`,
    40,
    58
  );

  autoTable(doc, {
    startY: 72,
    head: [
      [
        'Complaint ID',
        'Date',
        'Resident',
        'Mobile',
        'Area / Street',
        'Category',
        'Status',
        'Department',
      ],
    ],
    body: rows.map((r) => [
      r.complaintCode,
      new Date(r.createdAt).toLocaleDateString('en-IN'),
      r.citizenName,
      r.mobileNumber,
      r.areaStreet,
      r.category,
      r.status,
      r.assignedDepartment || '-',
    ]),
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: [11, 37, 69] },
  });

  const dateStamp = new Date().toISOString().slice(0, 10);
  doc.save(`HDMC-Ward65-Complaints-${dateStamp}.pdf`);
}
