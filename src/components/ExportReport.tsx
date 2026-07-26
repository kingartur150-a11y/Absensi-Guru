import React, { useState, useEffect } from 'react';
import { AttendanceRecord, Teacher, ActivitySchedule, ReportSignees } from '../types';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';
import { StorageService } from '../utils/storage';
import { Logo } from './Logo';
import { 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  Download, 
  Calendar, 
  User, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle,
  Building2,
  BookOpen,
  Edit3,
  Save,
  RotateCcw,
  Check,
  UserCheck,
  PenTool
} from 'lucide-react';

interface ExportReportProps {
  records: AttendanceRecord[];
  teachers: Teacher[];
  schedules: ActivitySchedule[];
}

export const ExportReport: React.FC<ExportReportProps> = ({
  records,
  teachers,
  schedules,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-07');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Signees State
  const [signees, setSignees] = useState<ReportSignees>(() => StorageService.getReportSignees());
  const [showSigneesModal, setShowSigneesModal] = useState<boolean>(false);
  const [editSigneesForm, setEditSigneesForm] = useState<ReportSignees>(signees);
  const [signeesSaveToast, setSigneesSaveToast] = useState<boolean>(false);

  useEffect(() => {
    setSignees(StorageService.getReportSignees());
  }, []);

  const handleOpenSigneesModal = () => {
    setEditSigneesForm(signees);
    setShowSigneesModal(true);
  };

  const handleSaveSignees = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveReportSignees(editSigneesForm);
    setSignees(editSigneesForm);
    setShowSigneesModal(false);
    setSigneesSaveToast(true);
    setTimeout(() => setSigneesSaveToast(false), 3000);
  };

  const handleResetSignees = () => {
    if (confirm('Kembalikan nama penandatangan ke pengaturan awal pesantren?')) {
      const defaultSignees = StorageService.getReportSignees();
      setEditSigneesForm({
        disciplineOfficerName: 'Ust. Ahmad Fauzi, S.Pd.I',
        disciplineOfficerTitle: 'Sie. Kedisiplinan Guru',
        leaderName: 'KH. Ahmad Yasfi, Lc., M.A.',
        leaderTitle: 'Pimpinan Pondok Pesantren',
        location: 'Bekasi',
      });
    }
  };

  // Parse Month Name in Indonesian
  const [yearStr, monthNumStr] = selectedMonth.split('-');
  const monthDate = new Date(parseInt(yearStr), parseInt(monthNumStr) - 1, 1);
  const monthNameIndo = monthDate.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });

  // Filter records by month, teacher, and category
  const filteredRecords = records.filter((rec) => {
    const matchesMonth = rec.date.startsWith(selectedMonth);
    const matchesTeacher =
      selectedTeacherId === 'ALL' || rec.teacherId === selectedTeacherId;
    const matchesCategory =
      selectedCategory === 'ALL' || rec.activityCategory === selectedCategory;
    return matchesMonth && matchesTeacher && matchesCategory;
  });

  // Stats for filtered records
  const totalEntries = filteredRecords.length;
  const totalHadir = filteredRecords.filter((r) => r.status === 'Hadir').length;
  const totalTerlambat = filteredRecords.filter((r) => r.status === 'Terlambat').length;
  const totalIzinSakit = filteredRecords.filter((r) => r.status === 'Izin' || r.status === 'Sakit').length;
  const totalAlpa = filteredRecords.filter((r) => r.status === 'Alpa').length;

  const attendanceRate = totalEntries > 0
    ? Math.round(((totalHadir + totalTerlambat) / totalEntries) * 100)
    : 0;

  const handleExportExcel = () => {
    exportToExcel(filteredRecords, teachers, monthNameIndo);
  };

  const handleExportPDF = () => {
    exportToPDF(filteredRecords, teachers, monthNameIndo);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#1B3022] p-5 md:p-6 rounded-2xl text-[#E9E0D2] border border-[#2D4536] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#D4AF37] text-[#1B3022] font-bold text-[10px] uppercase px-3 py-0.5 rounded-full mb-2">
            <FileSpreadsheet className="w-3.5 h-3.5" /> EKSPOR LAPORAN BULANAN
          </div>
          <h2 className="text-xl font-serif font-bold tracking-tight text-white">Pusat Laporan & Rekapitulasi Presensi</h2>
          <p className="text-xs text-[#8A9A8A] mt-0.5">
            Unduh laporan bulanan resmi dalam format Microsoft Excel (.xlsx) atau Dokumen PDF
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleOpenSigneesModal}
            className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#c39e2d] text-[#1B3022] text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
          >
            <PenTool className="w-4 h-4 text-[#1B3022]" />
            <span>Atur Penandatangan</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-[#2D4536] hover:bg-[#3E5C49] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#D4AF37]" />
            <span>Ekspor Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-[#A63D40] hover:bg-[#8F3336] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
          >
            <FileText className="w-4 h-4 text-rose-200" />
            <span>Ekspor PDF (.pdf)</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-[#F8F5F0] hover:bg-[#EAE2D6] text-[#1B3022] text-xs font-bold px-3.5 py-2.5 rounded-xl transition cursor-pointer border border-[#EAE2D6]"
          >
            <Printer className="w-4 h-4 text-[#2D3E40]" />
            <span>Cetak</span>
          </button>
        </div>
      </div>

      {signeesSaveToast && (
        <div className="bg-emerald-900 text-white p-3.5 rounded-2xl border border-amber-400 flex items-center gap-2 font-bold text-xs shadow-md animate-in fade-in">
          <Check className="w-4 h-4 text-amber-300" />
          Nama & Jabatan Penandatangan Laporan Berhasil Diperbarui!
        </div>
      )}

      {/* Filter Controls */}
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-[#EAE2D6] shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-[#8A9A8A] uppercase tracking-wider flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#2D4536]" /> Filter Laporan Presensi
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#4A5D4A] mb-1">Pilih Bulan & Tahun:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full bg-[#F8F5F0] text-xs font-bold p-2.5 border border-[#EAE2D6] rounded-xl outline-none focus:ring-2 focus:ring-[#2D4536] text-[#2D3E40]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4A5D4A] mb-1">Filter Guru / Musyrif:</label>
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="w-full bg-[#F8F5F0] text-xs font-bold p-2.5 border border-[#EAE2D6] rounded-xl outline-none focus:ring-2 focus:ring-[#2D4536] text-[#2D3E40]"
            >
              <option value="ALL">Semua Guru ({teachers.length})</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.nip})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4A5D4A] mb-1">Filter Jenis Kegiatan:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-[#F8F5F0] text-xs font-bold p-2.5 border border-[#EAE2D6] rounded-xl outline-none focus:ring-2 focus:ring-[#2D4536] text-[#2D3E40]"
            >
              <option value="ALL">Semua Kegiatan Pondok</option>
              {schedules.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-[#EAE2D6] shadow-xs">
          <p className="text-xs font-semibold text-[#8A9A8A] uppercase">Total Catatan</p>
          <div className="mt-1 text-2xl font-serif font-bold text-[#1B3022]">{totalEntries}</div>
          <p className="text-[11px] text-[#8A9A8A] mt-1">Sesuai filter terpilih</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#2D4536]/30 shadow-xs">
          <p className="text-xs font-semibold text-[#2D4536] uppercase">Hadir Tepat Waktu</p>
          <div className="mt-1 text-2xl font-serif font-bold text-[#2D4536]">{totalHadir}</div>
          <p className="text-[11px] text-[#2D4536] mt-1">Presensi disiplin</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#A63D40]/30 shadow-xs">
          <p className="text-xs font-semibold text-[#A63D40] uppercase">Terlambat</p>
          <div className="mt-1 text-2xl font-serif font-bold text-[#A63D40]">{totalTerlambat}</div>
          <p className="text-[11px] text-[#A63D40] mt-1">Lewat batas toleransi</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#EAE2D6] shadow-xs">
          <p className="text-xs font-semibold text-[#2D3E40] uppercase">Izin / Sakit</p>
          <div className="mt-1 text-2xl font-serif font-bold text-[#1B3022]">{totalIzinSakit}</div>
          <p className="text-[11px] text-[#8A9A8A] mt-1">Dengan pemberitahuan</p>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-[#1B3022] p-4 rounded-2xl text-white shadow-xs flex flex-col justify-between border border-[#2D4536]">
          <p className="text-xs font-semibold text-[#8A9A8A] uppercase">Rata-rata Kehadiran</p>
          <div className="text-3xl font-serif font-bold text-[#D4AF37] mt-1">{attendanceRate}%</div>
          <p className="text-[10px] text-[#8A9A8A] mt-1">Periode {monthNameIndo}</p>
        </div>
      </div>

      {/* Printable Preview Sheet */}
      <div className="bg-white rounded-2xl border border-[#EAE2D6] shadow-xs p-6 md:p-8 space-y-6 print:shadow-none print:border-none print:p-0">
        {/* Printable Official Kop Surat */}
        <div className="border-b-2 border-[#1B3022] pb-4 space-y-2 text-center">
          <Logo variant="full" size="md" />
          <h2 className="text-base font-serif font-bold text-[#1B3022] uppercase tracking-tight mt-2">
            LAPORAN BULANAN ABSENSI & KEDISIPLINAN GURU
          </h2>
          <p className="text-xs font-bold text-[#4A5D4A]">
            Periode: {monthNameIndo}
          </p>
        </div>

        {/* Teacher Summary Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-[#1B3022] uppercase tracking-wider">
            1. Rekapitulasi Kehadiran Per Guru / Musyrif
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#1B3022] text-[#E9E0D2] font-serif font-bold">
                  <th className="py-2.5 px-3 border border-[#2D4536]">No</th>
                  <th className="py-2.5 px-3 border border-[#2D4536]">NIP</th>
                  <th className="py-2.5 px-3 border border-[#2D4536]">Nama Ustadz / Ustadzah</th>
                  <th className="py-2.5 px-3 border border-[#2D4536] text-center">Hadir</th>
                  <th className="py-2.5 px-3 border border-[#2D4536] text-center">Terlambat</th>
                  <th className="py-2.5 px-3 border border-[#2D4536] text-center">Izin / Sakit</th>
                  <th className="py-2.5 px-3 border border-[#2D4536] text-center">Alpa</th>
                  <th className="py-2.5 px-3 border border-[#2D4536] text-center">% Kehadiran</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((tch, index) => {
                  const tchRecs = filteredRecords.filter(
                    (r) => r.teacherId === tch.id || r.teacherNip === tch.nip
                  );
                  const h = tchRecs.filter((r) => r.status === 'Hadir').length;
                  const l = tchRecs.filter((r) => r.status === 'Terlambat').length;
                  const i = tchRecs.filter((r) => r.status === 'Izin' || r.status === 'Sakit').length;
                  const a = tchRecs.filter((r) => r.status === 'Alpa').length;
                  const tot = tchRecs.length;
                  const rate = tot > 0 ? Math.round(((h + l) / tot) * 100) : 0;

                  return (
                    <tr key={tch.id} className="border-b border-[#F2EFE9] hover:bg-[#FDFBF9]">
                      <td className="py-2 px-3 border border-[#EAE2D6] text-center font-mono">{index + 1}</td>
                      <td className="py-2 px-3 border border-[#EAE2D6] font-mono font-semibold">{tch.nip}</td>
                      <td className="py-2 px-3 border border-[#EAE2D6] font-bold text-[#1B3022]">{tch.name}</td>
                      <td className="py-2 px-3 border border-[#EAE2D6] text-center font-bold text-[#2D4536]">{h}</td>
                      <td className="py-2 px-3 border border-[#EAE2D6] text-center font-bold text-[#A63D40]">{l}</td>
                      <td className="py-2 px-3 border border-[#EAE2D6] text-center font-bold text-[#2D3E40]">{i}</td>
                      <td className="py-2 px-3 border border-[#EAE2D6] text-center font-bold text-rose-600">{a}</td>
                      <td className="py-2 px-3 border border-[#EAE2D6] text-center font-black text-[#1B3022]">{rate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Logs */}
        <div className="space-y-3 pt-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            2. Catatan Transaksi Presensi Terbaru ({filteredRecords.length} Data)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white font-bold">
                  <th className="py-2 px-3 border border-slate-700">Tanggal & Jam</th>
                  <th className="py-2 px-3 border border-slate-700">Nama Guru</th>
                  <th className="py-2 px-3 border border-slate-700">Kegiatan</th>
                  <th className="py-2 px-3 border border-slate-700 text-center">Status</th>
                  <th className="py-2 px-3 border border-slate-700 text-center">Keterlambatan</th>
                  <th className="py-2 px-3 border border-slate-700">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.slice(0, 25).map((rec) => (
                  <tr key={rec.id} className="border-b border-slate-200">
                    <td className="py-1.5 px-3 border border-slate-200 font-mono">
                      {rec.date} ({rec.time})
                    </td>
                    <td className="py-1.5 px-3 border border-slate-200 font-semibold">{rec.teacherName}</td>
                    <td className="py-1.5 px-3 border border-slate-200">
                      {rec.activityCategory}
                      {rec.customActivityName ? ` (${rec.customActivityName})` : ''}
                    </td>
                    <td className="py-1.5 px-3 border border-slate-200 text-center font-bold">
                      {rec.status}
                    </td>
                    <td className="py-1.5 px-3 border border-slate-200 text-center font-bold text-amber-700">
                      {rec.lateMinutes > 0 ? `${rec.lateMinutes} mnt` : '-'}
                    </td>
                    <td className="py-1.5 px-3 border border-slate-200 text-slate-600 truncate max-w-xs">
                      {rec.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Official Signature Block */}
        <div className="pt-10 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-900 print:flex">
            <div className="text-center space-y-12 min-w-[200px]">
              <p>Mengetahui,</p>
              <div>
                <p className="font-bold border-b border-slate-900 pb-1 inline-block px-2">
                  ( {signees.disciplineOfficerName} )
                </p>
                <p className="text-[10px] text-slate-600 mt-1">{signees.disciplineOfficerTitle}</p>
              </div>
            </div>

            <div className="text-center space-y-12 min-w-[200px]">
              <p>
                {signees.location}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <div>
                <p className="font-bold border-b border-slate-900 pb-1 inline-block px-2">
                  ( {signees.leaderName} )
                </p>
                <p className="text-[10px] text-slate-600 mt-1">{signees.leaderTitle}</p>
              </div>
            </div>
          </div>

          <div className="text-center print:hidden pt-3 border-t border-slate-100">
            <button
              onClick={handleOpenSigneesModal}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 rounded-xl transition border border-emerald-200 cursor-pointer shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-600" />
              <span>Ubah Nama Penandatangan Laporan (Sie Kedisiplinan & Pimpinan)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Edit Penandatangan Laporan */}
      {showSigneesModal && (
        <div className="fixed inset-0 z-50 bg-[#1B3022]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-[#EAE2D6] animate-in fade-in zoom-in duration-200">
            <div className="bg-[#1B3022] p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base flex items-center gap-2 text-amber-300">
                  <PenTool className="w-5 h-5 text-amber-400" />
                  Pengaturan Penandatangan Laporan
                </h3>
                <p className="text-xs text-emerald-200 mt-0.5">
                  Ubah nama & jabatan Sie Kedisiplinan Guru serta Pimpinan Pesantren
                </p>
              </div>
              <button
                onClick={() => setShowSigneesModal(false)}
                className="text-emerald-300 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSignees} className="p-5 space-y-4">
              {/* Box 1: Sie Kedisiplinan */}
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  <UserCheck className="w-4 h-4 text-emerald-700" />
                  1. Penandatangan Kiri (Sie Kedisiplinan Guru)
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama & Gelar Sie Kedisiplinan:
                  </label>
                  <input
                    type="text"
                    required
                    value={editSigneesForm.disciplineOfficerName}
                    onChange={(e) =>
                      setEditSigneesForm({ ...editSigneesForm, disciplineOfficerName: e.target.value })
                    }
                    placeholder="Contoh: Ust. Ahmad Fauzi, S.Pd.I"
                    className="w-full bg-white text-xs p-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-700 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jabatan / Title:
                  </label>
                  <input
                    type="text"
                    required
                    value={editSigneesForm.disciplineOfficerTitle}
                    onChange={(e) =>
                      setEditSigneesForm({ ...editSigneesForm, disciplineOfficerTitle: e.target.value })
                    }
                    placeholder="Contoh: Sie. Kedisiplinan Guru"
                    className="w-full bg-white text-xs p-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              {/* Box 2: Pimpinan Pesantren */}
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
                  <Building2 className="w-4 h-4 text-amber-700" />
                  2. Penandatangan Kanan (Pimpinan Pondok Pesantren)
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kota / Lokasi Surat:
                  </label>
                  <input
                    type="text"
                    required
                    value={editSigneesForm.location}
                    onChange={(e) =>
                      setEditSigneesForm({ ...editSigneesForm, location: e.target.value })
                    }
                    placeholder="Contoh: Bekasi"
                    className="w-full bg-white text-xs p-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-600 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama & Gelar Pimpinan:
                  </label>
                  <input
                    type="text"
                    required
                    value={editSigneesForm.leaderName}
                    onChange={(e) =>
                      setEditSigneesForm({ ...editSigneesForm, leaderName: e.target.value })
                    }
                    placeholder="Contoh: KH. Ahmad Yasfi, Lc., M.A."
                    className="w-full bg-white text-xs p-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-600 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jabatan / Title Pimpinan:
                  </label>
                  <input
                    type="text"
                    required
                    value={editSigneesForm.leaderTitle}
                    onChange={(e) =>
                      setEditSigneesForm({ ...editSigneesForm, leaderTitle: e.target.value })
                    }
                    placeholder="Contoh: Pimpinan Pondok Pesantren"
                    className="w-full bg-white text-xs p-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleResetSignees}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Default</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSigneesModal(false)}
                    className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="bg-[#1B3022] hover:bg-[#2D4536] text-amber-300 text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4 text-amber-400" />
                    <span>Simpan Perubahan</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
