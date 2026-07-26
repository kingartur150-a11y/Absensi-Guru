import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AttendanceRecord, Teacher } from '../types';
import { StorageService } from './storage';

export function exportToExcel(
  records: AttendanceRecord[],
  teachers: Teacher[],
  monthYearStr: string
) {
  // Build row data for Excel worksheet
  const excelData = records.map((rec, index) => {
    return {
      'No': index + 1,
      'Tanggal': rec.date,
      'Jam': rec.time,
      'NIP': rec.teacherNip,
      'Nama Guru': rec.teacherName,
      'Kegiatan': rec.activityCategory === 'Kegiatan Lainnya' && rec.customActivityName
        ? `${rec.activityCategory} (${rec.customActivityName})`
        : rec.activityCategory,
      'Status': rec.status,
      'Keterlambatan': rec.lateMinutes > 0 ? `${rec.lateMinutes} Menit` : '-',
      'Metode Input': rec.method,
      'Keterangan / Catatan': rec.notes || '-',
    };
  });

  // Calculate summary per teacher
  const teacherSummary = teachers.map((tch, idx) => {
    const tchRecords = records.filter(r => r.teacherId === tch.id || r.teacherNip === tch.nip);
    const totalHadir = tchRecords.filter(r => r.status === 'Hadir').length;
    const totalTerlambat = tchRecords.filter(r => r.status === 'Terlambat').length;
    const totalIzin = tchRecords.filter(r => r.status === 'Izin').length;
    const totalSakit = tchRecords.filter(r => r.status === 'Sakit').length;
    const totalAlpa = tchRecords.filter(r => r.status === 'Alpa').length;
    const totalActivities = tchRecords.length;
    const attendanceRate = totalActivities > 0
      ? Math.round(((totalHadir + totalTerlambat) / totalActivities) * 100)
      : 0;

    return {
      'No': idx + 1,
      'NIP': tch.nip,
      'Nama Ustadz / Ustadzah': tch.name,
      'Jabatan': tch.role,
      'Total Kehadiran (Tepat Waktu)': totalHadir,
      'Total Terlambat': totalTerlambat,
      'Total Izin': totalIzin,
      'Total Sakit': totalSakit,
      'Total Alpa': totalAlpa,
      'Persentase Kehadiran': `${attendanceRate}%`,
    };
  });

  // Create workbook and add sheets
  const wb = XLSX.utils.book_new();

  const wsDetails = XLSX.utils.json_to_sheet(excelData);
  const wsSummary = XLSX.utils.json_to_sheet(teacherSummary);

  // Set column widths
  wsDetails['!cols'] = [
    { wch: 5 }, { wch: 12 }, { wch: 10 }, { wch: 15 }, { wch: 30 },
    { wch: 25 }, { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 30 }
  ];

  wsSummary['!cols'] = [
    { wch: 5 }, { wch: 15 }, { wch: 30 }, { wch: 25 },
    { wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 20 }
  ];

  XLSX.utils.book_append_sheet(wb, wsSummary, 'Rekapitulasi Guru');
  XLSX.utils.book_append_sheet(wb, wsDetails, 'Detail Absensi');

  // Save Excel file
  const fileName = `Laporan_Absensi_Guru_Ponpes_Yasfi_Shigor_${monthYearStr.replace(/\s+/g, '_')}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

export function exportToPDF(
  records: AttendanceRecord[],
  teachers: Teacher[],
  monthYearStr: string
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // 1. KOP SURAT OFFICIAL
  doc.setFillColor(13, 92, 58); // #0D5C3A Primary Green
  doc.rect(0, 0, pageWidth, 5, 'F');

  // Header Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(13, 92, 58);
  doc.text('PONDOK PESANTREN TAHFIDZ YASFI SHIGOR', pageWidth / 2, 16, { align: 'center' });

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text('Sukamaju - Tambelang - Bekasi - Jawa Barat', pageWidth / 2, 21, { align: 'center' });
  doc.text('Email: info@yasfishigor.ponpes.id | Website: www.yasfishigor.ponpes.id', pageWidth / 2, 25, { align: 'center' });

  // Divider Line
  doc.setDrawColor(13, 92, 58);
  doc.setLineWidth(1);
  doc.line(14, 28, pageWidth - 14, 28);
  doc.setLineWidth(0.3);
  doc.line(14, 29.5, pageWidth - 14, 29.5);

  // Document Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('REKAPITULASI LAPORAN ABSENSI GURU & MUSYRIF', pageWidth / 2, 37, { align: 'center' });
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`Periode Laporan: ${monthYearStr}`, pageWidth / 2, 42, { align: 'center' });

  // 2. SUMMARY TABLE PER TEACHER
  const summaryRows = teachers.map((tch, idx) => {
    const tchRecords = records.filter(r => r.teacherId === tch.id || r.teacherNip === tch.nip);
    const totalHadir = tchRecords.filter(r => r.status === 'Hadir').length;
    const totalTerlambat = tchRecords.filter(r => r.status === 'Terlambat').length;
    const totalIzinSakit = tchRecords.filter(r => r.status === 'Izin' || r.status === 'Sakit').length;
    const totalAlpa = tchRecords.filter(r => r.status === 'Alpa').length;
    const totalActivities = tchRecords.length;
    const rate = totalActivities > 0
      ? Math.round(((totalHadir + totalTerlambat) / totalActivities) * 100)
      : 0;

    return [
      (idx + 1).toString(),
      tch.nip,
      tch.name,
      totalHadir.toString(),
      totalTerlambat.toString(),
      totalIzinSakit.toString(),
      totalAlpa.toString(),
      `${rate}%`
    ];
  });

  autoTable(doc, {
    startY: 48,
    head: [['No', 'NIP', 'Nama Guru', 'Hadir', 'Terlambat', 'Izin/Sakit', 'Alpa', '% Kehadiran']],
    body: summaryRows,
    theme: 'grid',
    headStyles: {
      fillColor: [13, 92, 58],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'center', cellWidth: 28 },
      2: { cellWidth: 60 },
      3: { halign: 'center', cellWidth: 18 },
      4: { halign: 'center', cellWidth: 20 },
      5: { halign: 'center', cellWidth: 20 },
      6: { halign: 'center', cellWidth: 16 },
      7: { halign: 'center', cellWidth: 20 },
    },
  });

  // 3. RECENT DETAILS TABLE
  const lastY = (doc as any).lastAutoTable.finalY + 10;

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(13, 92, 58);
  doc.text('CATATAN DETAIL TRANSAKSI ABSENSI', 14, lastY);

  const detailRows = records.slice(0, 30).map((rec, idx) => [
    (idx + 1).toString(),
    `${rec.date} (${rec.time})`,
    rec.teacherName,
    rec.activityCategory === 'Kegiatan Lainnya' && rec.customActivityName
      ? rec.customActivityName
      : rec.activityCategory,
    rec.status,
    rec.lateMinutes > 0 ? `${rec.lateMinutes} mnt` : '-',
    rec.notes || '-'
  ]);

  autoTable(doc, {
    startY: lastY + 3,
    head: [['No', 'Tanggal & Waktu', 'Nama Guru', 'Kegiatan', 'Status', 'Keterlambatan', 'Catatan']],
    body: detailRows,
    theme: 'striped',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 8,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 7.5,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { halign: 'center', cellWidth: 32 },
      2: { cellWidth: 48 },
      3: { cellWidth: 40 },
      4: { halign: 'center', cellWidth: 20 },
      5: { halign: 'center', cellWidth: 22 },
      6: { cellWidth: 22 },
    },
  });

  // 4. SIGNATURE BLOCK (KOP TANDA TANGAN)
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Avoid overflow page
  if (finalY + 35 > doc.internal.pageSize.getHeight()) {
    doc.addPage();
  }

  const currentY = finalY + 35 > doc.internal.pageSize.getHeight() ? 25 : finalY;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);

  const signees = StorageService.getReportSignees();
  
  // Right signature (Pimpinan)
  doc.text(`${signees.location}, ${todayFormatted}`, pageWidth - 60, currentY, { align: 'center' });
  doc.text(`${signees.leaderTitle},`, pageWidth - 60, currentY + 5, { align: 'center' });
  doc.text(`( ${signees.leaderName} )`, pageWidth - 60, currentY + 28, { align: 'center' });

  // Left signature (Sie Kedisiplinan)
  doc.text('Mengetahui,', 40, currentY, { align: 'center' });
  doc.text(`${signees.disciplineOfficerTitle},`, 40, currentY + 5, { align: 'center' });
  doc.text(`( ${signees.disciplineOfficerName} )`, 40, currentY + 28, { align: 'center' });

  // Download PDF
  doc.save(`Laporan_Absensi_Yasfi_Shigor_${monthYearStr.replace(/\s+/g, '_')}.pdf`);
}
