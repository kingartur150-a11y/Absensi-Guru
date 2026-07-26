import React, { useState } from 'react';
import { AttendanceRecord, Teacher, ActivitySchedule } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Calendar, 
  Search, 
  Plus, 
  QrCode, 
  MessageSquare, 
  Trash2,
  BookOpen,
  GraduationCap,
  Building2,
  Sun,
  Filter,
  Check
} from 'lucide-react';

interface DailySummaryProps {
  records: AttendanceRecord[];
  teachers: Teacher[];
  schedules: ActivitySchedule[];
  onNavigateToInput: (category?: string) => void;
  onNavigateToNotif: () => void;
  onDeleteRecord: (id: string) => void;
}

export const DailySummary: React.FC<DailySummaryProps> = ({
  records,
  teachers,
  schedules,
  onNavigateToInput,
  onNavigateToNotif,
  onDeleteRecord,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Filter records by selected date
  const dateRecords = records.filter((r) => r.date === selectedDate);

  // Statistics calculation
  const totalPresent = dateRecords.filter((r) => r.status === 'Hadir').length;
  const totalLate = dateRecords.filter((r) => r.status === 'Terlambat').length;
  const totalIzinSakit = dateRecords.filter(
    (r) => r.status === 'Izin' || r.status === 'Sakit'
  ).length;
  const totalAlpa = dateRecords.filter((r) => r.status === 'Alpa').length;
  const totalEntries = dateRecords.length;

  const attendanceRate =
    teachers.length > 0
      ? Math.min(100, Math.round(((totalPresent + totalLate) / teachers.length) * 100))
      : 0;

  // Filter list
  const filteredRecords = dateRecords.filter((rec) => {
    const matchesSearch =
      rec.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.teacherNip.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === 'ALL' || rec.activityCategory === categoryFilter;
    const matchesStatus =
      statusFilter === 'ALL' || rec.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Tasmi':
        return BookOpen;
      case 'Bimbingan':
        return GraduationCap;
      case 'Sholat Berjamaah':
        return Building2;
      case 'Sholat Duha':
        return Sun;
      default:
        return Calendar;
    }
  };

  const getStatusBadge = (status: string, lateMin: number) => {
    switch (status) {
      case 'Hadir':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            TEPAT WAKTU
          </span>
        );
      case 'Terlambat':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            TERLAMBAT ({lateMin} M)
          </span>
        );
      case 'Izin':
      case 'Sakit':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
            <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
            {status.toUpperCase()}
          </span>
        );
      case 'Alpa':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            TANPA KETERANGAN
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Date Selector */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-800" />
            Rekapitulasi Absensi Harian
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pantau kedisiplinan & kehadiran guru/musyrif pada seluruh kegiatan pondok
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase text-[10px] px-2">Tanggal:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white border border-slate-300 text-slate-900 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          <button
            onClick={() => onNavigateToInput()}
            className="flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            Tambah Absensi
          </button>

          <button
            onClick={() => onNavigateToInput()}
            className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-emerald-950 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer shadow-sm"
          >
            <QrCode className="w-4 h-4" />
            Scan QR Code
          </button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
            Hadir Tepat Waktu
          </p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-extrabold text-emerald-700">{totalPresent}</span>
            <span className="text-[10px] text-emerald-800 mb-1 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Guru
            </span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-emerald-600" /> Sesuai batas waktu
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs relative overflow-hidden">
          {totalLate > 0 && (
            <div className="absolute top-0 right-0 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl">
              LOGS
            </div>
          )}
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
            Keterlambatan
          </p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-extrabold text-amber-600">{totalLate}</span>
            {totalLate > 0 && (
              <button
                onClick={onNavigateToNotif}
                className="text-[10px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded transition mb-1 cursor-pointer"
              >
                Kirim WA →
              </button>
            )}
          </div>
          <div className="mt-2 text-[11px] text-amber-600 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Melewati batas jadwal
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-xs">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
            Izin / Sakit
          </p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-extrabold text-blue-700">{totalIzinSakit}</span>
            <span className="text-[10px] text-blue-800 mb-1 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Tercatat
            </span>
          </div>
          <div className="mt-2 text-[11px] text-blue-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-blue-600" /> Dengan Keterangan
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-xs">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
            Alpa (Tanpa Ket.)
          </p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-extrabold text-rose-700">{totalAlpa}</span>
            <span className="text-[10px] text-rose-800 mb-1 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              Absen
            </span>
          </div>
          <div className="mt-2 text-[11px] text-rose-600 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-rose-600" /> Tanpa konfirmasi
          </div>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-emerald-900 to-teal-950 p-5 rounded-2xl text-white shadow-md flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">
              Tingkat Kehadiran
            </p>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-3xl font-black text-amber-300">{attendanceRate}%</span>
              <span className="text-[10px] text-emerald-200">
                ({totalPresent + totalLate}/{teachers.length})
              </span>
            </div>
          </div>
          <div className="mt-2 w-full bg-emerald-950/80 rounded-full h-2 overflow-hidden border border-emerald-800/80">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${attendanceRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Cards Quick Launch */}
      <div>
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
          <span>Kegiatan Absensi Rutin Pondok:</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {schedules.map((sch) => {
            const Icon = getCategoryIcon(sch.id);
            const countForSch = dateRecords.filter(
              (r) => r.activityCategory === sch.id
            ).length;

            return (
              <button
                key={sch.id}
                onClick={() => onNavigateToInput(sch.id)}
                className="bg-white hover:bg-emerald-50/50 p-4 rounded-2xl border border-slate-200 hover:border-emerald-600 transition text-left group shadow-xs cursor-pointer flex flex-col justify-between h-full"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 group-hover:bg-emerald-800 group-hover:text-amber-300 transition">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {sch.defaultTime}
                    </span>
                  </div>

                  <h4 className="mt-3 font-bold text-sm text-slate-900 group-hover:text-emerald-900">
                    {sch.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                    {sch.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">
                    {countForSch} Terabsen
                  </span>
                  <span className="text-amber-600 font-bold group-hover:translate-x-0.5 transition">
                    Absen →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detailed Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-50">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Daftar Presensi Guru & Musyrif ({dateRecords.length})
            </h3>
            <p className="text-xs text-slate-500">
              Menampilkan catatan absensi tanggal {selectedDate}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari NIP / Nama Guru..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white text-xs border border-slate-300 rounded-xl px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="ALL">Semua Kegiatan</option>
              {schedules.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white text-xs border border-slate-300 rounded-xl px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="ALL">Semua Status</option>
              <option value="Hadir">Hadir</option>
              <option value="Terlambat">Terlambat</option>
              <option value="Izin">Izin</option>
              <option value="Sakit">Sakit</option>
              <option value="Alpa">Alpa</option>
            </select>
          </div>
        </div>

        {/* Table Body */}
        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Filter className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-800">Tidak ada catatan absensi ditemukan</p>
            <p className="text-xs text-slate-500 mt-1">
              {dateRecords.length === 0
                ? `Belum ada data absensi untuk tanggal ${selectedDate}`
                : 'Coba ubah kata kunci pencarian atau filter'}
            </p>
            <button
              onClick={() => onNavigateToInput()}
              className="mt-4 inline-flex items-center gap-2 bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-300" /> Input Absensi Baru
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] border-b border-slate-200">
                  <th className="py-3.5 px-6">Waktu</th>
                  <th className="py-3.5 px-6">Guru / Musyrif</th>
                  <th className="py-3.5 px-6">Kegiatan</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Metode</th>
                  <th className="py-3.5 px-6">Keterangan</th>
                  <th className="py-3.5 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((rec) => {
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-6 font-mono text-slate-800 font-semibold whitespace-nowrap">
                        {rec.time}
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">{rec.teacherName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{rec.teacherNip}</div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="font-semibold text-slate-800">
                          {rec.activityCategory}
                        </span>
                        {rec.customActivityName && (
                          <div className="text-[11px] text-slate-500 font-medium italic">
                            ({rec.customActivityName})
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        {getStatusBadge(rec.status, rec.lateMinutes)}
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                            rec.method === 'QR Code'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {rec.method}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-slate-600 max-w-xs truncate">
                        {rec.notes || '-'}
                      </td>

                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {rec.status === 'Terlambat' && (
                            <button
                              onClick={onNavigateToNotif}
                              title="Kirim Notifikasi WA Keterlambatan"
                              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => onDeleteRecord(rec.id)}
                            title="Hapus Catatan"
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
