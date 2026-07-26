import React, { useState, useEffect } from 'react';
import { 
  Teacher, 
  ActivitySchedule, 
  ActivityCategory, 
  AttendanceStatus, 
  PrayerTime, 
  PRAYER_SCHEDULES,
  TasmiTime,
  TASMI_SCHEDULES,
  TasmiScheduleInfo,
  BimbinganTime,
  BIMBINGAN_SCHEDULES,
  BimbinganScheduleInfo,
  PrayerScheduleInfo,
  EkstraOption,
  EKSTRA_OPTIONS,
  EkstraScheduleInfo,
  KEGIATAN_LAINNYA_PRESETS,
  KegiatanLainnyaPreset
} from '../types';
import { 
  QrCode, 
  User, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Sparkles, 
  Search, 
  Camera, 
  Upload,
  BookOpen,
  GraduationCap,
  Building2,
  Sun,
  Trophy,
  X
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { StorageService } from '../utils/storage';

interface AttendanceInputProps {
  teachers: Teacher[];
  schedules: ActivitySchedule[];
  initialCategory?: string;
  onSubmitRecord: (record: {
    teacherId: string;
    teacherName: string;
    teacherNip: string;
    activityCategory: ActivityCategory;
    customActivityName?: string;
    date: string;
    time: string;
    status: AttendanceStatus;
    lateMinutes: number;
    notes?: string;
    method: 'Manual' | 'QR Code';
  }) => void;
  onDone: () => void;
}

export const AttendanceInput: React.FC<AttendanceInputProps> = ({
  teachers,
  schedules,
  initialCategory,
  onSubmitRecord,
  onDone,
}) => {
  // Helper functions for safe time/date strings
  const getCurrentTimeString = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const getCurrentDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [activeSubTab, setActiveSubTab] = useState<'manual' | 'qr'>('manual');

  // Manual Form State
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory>(
    (initialCategory as ActivityCategory) || 'Sholat Berjamaah'
  );
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerTime>('Subuh');
  const [selectedTasmiTime, setSelectedTasmiTime] = useState<TasmiTime>('Subuh');
  const [selectedBimbinganTime, setSelectedBimbinganTime] = useState<BimbinganTime>('Subuh');
  const [selectedEkstra, setSelectedEkstra] = useState<EkstraOption>('Komputer');
  const [customActivityName, setCustomActivityName] = useState('');
  const [isAutoTime, setIsAutoTime] = useState<boolean>(true);
  const [inputDate, setInputDate] = useState<string>(getCurrentDateString());
  const [inputTime, setInputTime] = useState<string>(getCurrentTimeString());
  const [status, setStatus] = useState<AttendanceStatus>('Hadir');
  const [lateMinutes, setLateMinutes] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [isSuccessToast, setIsSuccessToast] = useState(false);

  // Dynamic sub-schedules from StorageService
  const [prayerSchedules, setPrayerSchedules] = useState<PrayerScheduleInfo[]>([]);
  const [tasmiSchedules, setTasmiSchedules] = useState<TasmiScheduleInfo[]>([]);
  const [bimbinganSchedules, setBimbinganSchedules] = useState<BimbinganScheduleInfo[]>([]);
  const [ekstraSchedules, setEkstraSchedules] = useState<EkstraScheduleInfo[]>([]);
  const [kegiatanPresets, setKegiatanPresets] = useState<{ name: KegiatanLainnyaPreset; label: string; defaultTime: string }[]>([]);

  const loadSubSchedules = () => {
    setPrayerSchedules(StorageService.getPrayerSchedules());
    setTasmiSchedules(StorageService.getTasmiSchedules());
    setBimbinganSchedules(StorageService.getBimbinganSchedules());
    setEkstraSchedules(StorageService.getEkstraSchedules());
    setKegiatanPresets(StorageService.getKegiatanLainnyaPresets());
  };

  useEffect(() => {
    loadSubSchedules();
    window.addEventListener('yasfi_schedules_updated', loadSubSchedules);
    return () => window.removeEventListener('yasfi_schedules_updated', loadSubSchedules);
  }, []);

  // Auto pick prayer time, tasmi time & bimbingan time based on current time on mount
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 3 && hour < 7) setSelectedPrayer('Subuh');
    else if (hour >= 11 && hour < 14) setSelectedPrayer('Zuhur');
    else if (hour >= 14 && hour < 17) setSelectedPrayer('Ashar');
    else if (hour >= 17 && hour < 19) setSelectedPrayer('Maghrib');
    else if (hour >= 19 || hour < 3) setSelectedPrayer('Isya');

    if (hour < 12) {
      setSelectedBimbinganTime('Subuh');
      setSelectedTasmiTime('Subuh');
    } else if (hour >= 12 && hour < 18) {
      setSelectedBimbinganTime('Ashar');
      setSelectedTasmiTime('Ashar');
    } else {
      setSelectedBimbinganTime('Isya');
      setSelectedTasmiTime('Isya');
    }
  }, []);

  // Auto-update date and time when isAutoTime is enabled
  useEffect(() => {
    if (!isAutoTime) return;

    const updateDateTime = () => {
      setInputDate(getCurrentDateString());
      setInputTime(getCurrentTimeString());
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 5000); // refresh time every 5s
    return () => clearInterval(timer);
  }, [isAutoTime]);

  // QR State
  const [qrScanning, setQrScanning] = useState(false);
  const [qrError, setQrError] = useState('');
  const [scannedResult, setScannedResult] = useState<string | null>(null);

  // Update late calculation whenever time or schedule changes
  useEffect(() => {
    const currentSch = schedules.find((s) => s.id === selectedCategory);
    if (!currentSch || status === 'Izin' || status === 'Sakit' || status === 'Alpa') {
      return;
    }

    let defaultTimeString = currentSch.defaultTime;
    if (selectedCategory === 'Sholat Berjamaah') {
      const pSch = (prayerSchedules.length ? prayerSchedules : PRAYER_SCHEDULES).find((p) => p.name === selectedPrayer);
      if (pSch) defaultTimeString = pSch.defaultTime;
    } else if (selectedCategory === 'Tasmi') {
      const tSch = (tasmiSchedules.length ? tasmiSchedules : TASMI_SCHEDULES).find((t) => t.name === selectedTasmiTime);
      if (tSch) defaultTimeString = tSch.defaultTime;
    } else if (selectedCategory === 'Bimbingan') {
      const bSch = (bimbinganSchedules.length ? bimbinganSchedules : BIMBINGAN_SCHEDULES).find((b) => b.name === selectedBimbinganTime);
      if (bSch) defaultTimeString = bSch.defaultTime;
    } else if (selectedCategory === 'Ekstrakulikuler') {
      const eSch = (ekstraSchedules.length ? ekstraSchedules : EKSTRA_OPTIONS).find((e) => e.name === selectedEkstra);
      if (eSch) defaultTimeString = eSch.defaultTime;
    } else if (selectedCategory === 'Kegiatan Lainnya') {
      const kSch = (kegiatanPresets.length ? kegiatanPresets : KEGIATAN_LAINNYA_PRESETS).find((k) => k.name === customActivityName);
      if (kSch) defaultTimeString = kSch.defaultTime;
    }

    const [targetH, targetM] = defaultTimeString.split(':').map(Number);
    const [inputH, inputM] = inputTime.split(':').map(Number);

    const targetTotal = targetH * 60 + targetM + currentSch.lateToleranceMinutes;
    const inputTotal = inputH * 60 + inputM;

    if (inputTotal > targetTotal) {
      const diff = inputTotal - (targetH * 60 + targetM);
      setLateMinutes(diff);
      setStatus('Terlambat');
    } else {
      setLateMinutes(0);
      setStatus('Hadir');
    }
  }, [inputTime, selectedCategory, selectedPrayer, selectedTasmiTime, selectedBimbinganTime, selectedEkstra, customActivityName, schedules, prayerSchedules, tasmiSchedules, bimbinganSchedules, ekstraSchedules, kegiatanPresets]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tch = teachers.find((t) => t.id === selectedTeacherId);
    if (!tch) {
      alert('Pilih guru / musyrif terlebih dahulu!');
      return;
    }

    if (selectedCategory === 'Kegiatan Lainnya' && !customActivityName.trim()) {
      alert('Tuliskan nama kegiatan khusus!');
      return;
    }

    onSubmitRecord({
      teacherId: tch.id,
      teacherName: tch.name,
      teacherNip: tch.nip,
      activityCategory: selectedCategory,
      customActivityName:
        selectedCategory === 'Sholat Berjamaah'
          ? `Sholat ${selectedPrayer} Berjamaah`
          : selectedCategory === 'Tasmi'
          ? `Tasmi ${selectedTasmiTime}`
          : selectedCategory === 'Bimbingan'
          ? `Bimbingan ${selectedBimbinganTime}`
          : selectedCategory === 'Ekstrakulikuler'
          ? `Ekskul ${selectedEkstra}`
          : selectedCategory === 'Kegiatan Lainnya'
          ? customActivityName
          : undefined,
      date: inputDate,
      time: inputTime + ':00',
      status: status,
      lateMinutes: status === 'Terlambat' ? lateMinutes : 0,
      notes: notes,
      method: 'Manual',
    });

    setIsSuccessToast(true);
    setTimeout(() => {
      setIsSuccessToast(false);
      // Reset form
      setSelectedTeacherId('');
      setNotes('');
    }, 2000);
  };

  // Start QR Camera Scanner
  const startScanner = async () => {
    setQrError('');
    setQrScanning(true);

    try {
      const html5QrCode = new Html5Qrcode('qr-reader');
      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          html5QrCode.stop();
          setQrScanning(false);
          handleQrDecoded(decodedText);
        },
        () => {}
      );
    } catch (err) {
      setQrError('Tidak dapat mengakses kamera. Pastikan izin kamera aktif.');
      setQrScanning(false);
    }
  };

  const handleQrDecoded = (code: string) => {
    setScannedResult(code);

    // Look up teacher by NIP or ID
    const tch = teachers.find((t) => t.nip === code || t.id === code || t.name.toLowerCase().includes(code.toLowerCase()));
    
    if (tch) {
      setSelectedTeacherId(tch.id);
      setActiveSubTab('manual');
      alert(`QR Discan: Berhasil mengidentifikasi ${tch.name} (${tch.nip})`);
    } else {
      alert(`Kode QR Discan: "${code}". Pilih guru secara manual jika data belum cocok.`);
      setActiveSubTab('manual');
    }
  };

  const filteredTeachers = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      t.nip.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      t.role.toLowerCase().includes(teacherSearch.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Toast Notification */}
      {isSuccessToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-900 text-white p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-amber-400">
          <CheckCircle2 className="w-6 h-6 text-amber-300" />
          <div>
            <h4 className="font-bold text-sm">Absensi Berhasil Disimpan!</h4>
            <p className="text-xs text-emerald-200">Data presensi guru telah masuk ke rekapitulasi harian.</p>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-950 p-6 text-white border-b border-emerald-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-amber-400 text-emerald-950 font-bold text-[10px] uppercase px-3 py-0.5 rounded-full mb-1">
              INPUT ABSENSI GURU
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">Formulir & QR Code Presensi</h2>
            <p className="text-xs text-emerald-200">
              Pilih kegiatan: Tasmi', Bimbingan, Sholat Berjama'ah, Sholat Duha, atau Kegiatan Lainnya
            </p>
          </div>

          {/* Sub Tab Switcher */}
          <div className="bg-emerald-950/80 p-1 rounded-xl border border-emerald-800/80 flex items-center gap-1">
            <button
              onClick={() => setActiveSubTab('manual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeSubTab === 'manual'
                  ? 'bg-amber-400 text-emerald-950 shadow-xs'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" /> Input Manual
            </button>
            <button
              onClick={() => setActiveSubTab('qr')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeSubTab === 'qr'
                  ? 'bg-amber-400 text-emerald-950 shadow-xs'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" /> Scan QR Code
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeSubTab === 'manual' ? (
          <form onSubmit={handleManualSubmit} className="p-5 md:p-6 space-y-6">
            {/* 1. Select Activity Category */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                1. Pilih Jenis Kegiatan Presensi <span className="text-rose-500">*</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {schedules.map((sch) => {
                  const isSelected = selectedCategory === sch.id;
                  return (
                    <button
                      key={sch.id}
                      type="button"
                      onClick={() => setSelectedCategory(sch.id)}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between h-full ${
                        isSelected
                          ? 'bg-emerald-800 text-white border-emerald-800 ring-2 ring-amber-400'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                      }`}
                    >
                      <div>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-amber-400 text-emerald-950' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {sch.defaultTime}
                        </span>
                        <h4 className="mt-2 text-xs font-bold leading-tight">{sch.name}</h4>
                      </div>
                      <p
                        className={`text-[10px] mt-2 line-clamp-1 ${
                          isSelected ? 'text-emerald-200' : 'text-slate-400'
                        }`}
                      >
                        Batas: {sch.defaultTime} (+{sch.lateToleranceMinutes}m)
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Sub-selector for Sholat Berjamaah: 5 Waktu Sholat */}
              {selectedCategory === 'Sholat Berjamaah' && (
                <div className="mt-3 bg-gradient-to-r from-emerald-900 to-teal-950 p-4 rounded-xl border border-emerald-800 text-white space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      Pilih Waktu Sholat 5 Waktu:
                    </label>
                    <span className="text-[10px] bg-emerald-800 text-emerald-100 px-2 py-0.5 rounded-md font-mono">
                      Waktu Target Standar
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                    {(prayerSchedules.length ? prayerSchedules : PRAYER_SCHEDULES).map((p) => {
                      const isPrayerSelected = selectedPrayer === p.name;
                      return (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => {
                            setSelectedPrayer(p.name);
                            if (!isAutoTime) {
                              setInputTime(p.defaultTime);
                            }
                          }}
                          className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                            isPrayerSelected
                              ? 'bg-amber-400 text-emerald-950 border-amber-300 font-extrabold shadow-md ring-2 ring-white/50'
                              : 'bg-emerald-950/60 hover:bg-emerald-800/80 text-emerald-100 border-emerald-800/80 font-semibold'
                          }`}
                        >
                          <span className="text-xs uppercase tracking-wide">{p.name}</span>
                          <span
                            className={`text-[10px] font-mono mt-0.5 px-1.5 py-0.2 rounded ${
                              isPrayerSelected
                                ? 'bg-emerald-950 text-amber-300 font-bold'
                                : 'text-emerald-300/80'
                            }`}
                          >
                            {p.defaultTime} WIB
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sub-selector for Tasmi: Subuh, Ashar, Isya */}
              {selectedCategory === 'Tasmi' && (
                <div className="mt-3 bg-gradient-to-r from-emerald-900 to-teal-950 p-4 rounded-xl border border-emerald-800 text-white space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                      Pilih Waktu Tasmi Al-Qur'an:
                    </label>
                    <span className="text-[10px] bg-emerald-800 text-emerald-100 px-2 py-0.5 rounded-md font-mono">
                      Subuh, Ashar, atau Isya
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {(tasmiSchedules.length ? tasmiSchedules : TASMI_SCHEDULES).map((t) => {
                      const isTasmiSelected = selectedTasmiTime === t.name;
                      return (
                        <button
                          key={t.name}
                          type="button"
                          onClick={() => {
                            setSelectedTasmiTime(t.name);
                            if (!isAutoTime) {
                              setInputTime(t.defaultTime);
                            }
                          }}
                          className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                            isTasmiSelected
                              ? 'bg-amber-400 text-emerald-950 border-amber-300 font-extrabold shadow-md ring-2 ring-white/50'
                              : 'bg-emerald-950/60 hover:bg-emerald-800/80 text-emerald-100 border-emerald-800/80 font-semibold'
                          }`}
                        >
                          <span className="text-xs uppercase tracking-wide">Tasmi {t.name}</span>
                          <span
                            className={`text-[10px] font-mono mt-0.5 px-1.5 py-0.2 rounded ${
                              isTasmiSelected
                                ? 'bg-emerald-950 text-amber-300 font-bold'
                                : 'text-emerald-300/80'
                            }`}
                          >
                            {t.defaultTime} WIB
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sub-selector for Bimbingan: Subuh, Ashar, Isya */}
              {selectedCategory === 'Bimbingan' && (
                <div className="mt-3 bg-gradient-to-r from-emerald-900 to-teal-950 p-4 rounded-xl border border-emerald-800 text-white space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      Pilih Waktu Bimbingan & KBM:
                    </label>
                    <span className="text-[10px] bg-emerald-800 text-emerald-100 px-2 py-0.5 rounded-md font-mono">
                      Subuh, Ashar, atau Isya
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {(bimbinganSchedules.length ? bimbinganSchedules : BIMBINGAN_SCHEDULES).map((b) => {
                      const isBimbinganSelected = selectedBimbinganTime === b.name;
                      return (
                        <button
                          key={b.name}
                          type="button"
                          onClick={() => {
                            setSelectedBimbinganTime(b.name);
                            if (!isAutoTime) {
                              setInputTime(b.defaultTime);
                            }
                          }}
                          className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                            isBimbinganSelected
                              ? 'bg-amber-400 text-emerald-950 border-amber-300 font-extrabold shadow-md ring-2 ring-white/50'
                              : 'bg-emerald-950/60 hover:bg-emerald-800/80 text-emerald-100 border-emerald-800/80 font-semibold'
                          }`}
                        >
                          <span className="text-xs uppercase tracking-wide">Bimbingan {b.name}</span>
                          <span
                            className={`text-[10px] font-mono mt-0.5 px-1.5 py-0.2 rounded ${
                              isBimbinganSelected
                                ? 'bg-emerald-950 text-amber-300 font-bold'
                                : 'text-emerald-300/80'
                            }`}
                          >
                            {b.defaultTime} WIB
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sub-selector for Ekstrakulikuler: 8 Pilihan Ekskul */}
              {selectedCategory === 'Ekstrakulikuler' && (
                <div className="mt-3 bg-gradient-to-r from-emerald-900 to-teal-950 p-4 rounded-xl border border-emerald-800 text-white space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      Pilih Cabang Ekstrakulikuler & Minat Bakat:
                    </label>
                    <span className="text-[10px] bg-emerald-800 text-emerald-100 px-2 py-0.5 rounded-md font-mono">
                      8 Pilihan Ekskul
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {(ekstraSchedules.length ? ekstraSchedules : EKSTRA_OPTIONS).map((e) => {
                      const isEkstraSelected = selectedEkstra === e.name;
                      return (
                        <button
                          key={e.name}
                          type="button"
                          onClick={() => {
                            setSelectedEkstra(e.name);
                            if (!isAutoTime) {
                              setInputTime(e.defaultTime);
                            }
                          }}
                          className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                            isEkstraSelected
                              ? 'bg-amber-400 text-emerald-950 border-amber-300 font-extrabold shadow-md ring-2 ring-white/50'
                              : 'bg-emerald-950/60 hover:bg-emerald-800/80 text-emerald-100 border-emerald-800/80 font-semibold'
                          }`}
                        >
                          <span className="text-xs uppercase tracking-wide">{e.name}</span>
                          <span
                            className={`text-[10px] font-mono mt-0.5 px-1.5 py-0.2 rounded ${
                              isEkstraSelected
                                ? 'bg-emerald-950 text-amber-300 font-bold'
                                : 'text-emerald-300/80'
                            }`}
                          >
                            {e.defaultTime} WIB
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Custom Input & Quick Presets for "Kegiatan Lainnya" */}
              {selectedCategory === 'Kegiatan Lainnya' && (
                <div className="mt-3 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                      <span>Pilihan Cepat Kegiatan Lainnya:</span>
                      <span className="text-[10px] text-slate-500 font-normal">Klik untuk memilih langsung</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(kegiatanPresets.length ? kegiatanPresets : KEGIATAN_LAINNYA_PRESETS).map((p) => {
                        const isPresetSelected = customActivityName === p.name;
                        return (
                          <button
                            key={p.name}
                            type="button"
                            onClick={() => {
                              setCustomActivityName(p.name);
                              if (!isAutoTime) {
                                setInputTime(p.defaultTime);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                              isPresetSelected
                                ? 'bg-emerald-800 text-amber-300 border-emerald-900 shadow-xs'
                                : 'bg-white hover:bg-emerald-50 text-slate-700 border-slate-300'
                            }`}
                          >
                            <span>{p.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-200">
                    <label className="block text-xs font-bold text-slate-800">
                      Tuliskan / Edit Nama Kegiatan Khusus:
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Rapat Bulanan, Ratibul Hadad, Belajar Malam, Kerja Bakti..."
                      value={customActivityName}
                      onChange={(e) => setCustomActivityName(e.target.value)}
                      required
                      className="w-full bg-white text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold text-slate-800"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 2. Select Teacher */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  2. Pilih Ustadz / Ustadzah <span className="text-rose-500">*</span>
                </label>

                <div className="relative w-48">
                  <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari guru..."
                    value={teacherSearch}
                    onChange={(e) => setTeacherSearch(e.target.value)}
                    className="w-full bg-slate-50 text-[11px] pl-7 pr-2 py-1 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1.5 border border-slate-200 rounded-xl bg-slate-50/50">
                {filteredTeachers.map((tch) => {
                  const isSelected = selectedTeacherId === tch.id;
                  return (
                    <button
                      key={tch.id}
                      type="button"
                      onClick={() => setSelectedTeacherId(tch.id)}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-3 ${
                        isSelected
                          ? 'bg-emerald-800 text-white border-emerald-800 ring-2 ring-amber-400'
                          : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200'
                      }`}
                    >
                      {tch.avatarUrl ? (
                        <img
                          src={tch.avatarUrl}
                          alt={tch.name}
                          className={`w-9 h-9 rounded-full object-cover shrink-0 border-2 ${
                            isSelected ? 'border-amber-400' : 'border-emerald-700'
                          }`}
                        />
                      ) : (
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            isSelected
                              ? 'bg-amber-400 text-emerald-950'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {tch.gender === 'L' ? 'Ust' : 'Usth'}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="font-bold text-xs truncate">{tch.name}</div>
                        <div
                          className={`text-[10px] font-mono ${
                            isSelected ? 'text-emerald-200' : 'text-slate-400'
                          }`}
                        >
                          {tch.nip} • {tch.role}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Date, Time & Status */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  3. Tanggal, Waktu & Status Presensi
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAutoTime(true);
                      setInputDate(getCurrentDateString());
                      setInputTime(getCurrentTimeString());
                    }}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
                      isAutoTime
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isAutoTime ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                    {isAutoTime ? 'Waktu Otomatis (Realtime)' : 'Set ke Waktu Sekarang'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Absensi</label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      value={inputDate}
                      onChange={(e) => {
                        setInputDate(e.target.value);
                        setIsAutoTime(false);
                      }}
                      required
                      className="w-full bg-white text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jam Absen</label>
                  <div className="relative">
                    <Clock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="time"
                      value={inputTime}
                      onChange={(e) => {
                        setInputTime(e.target.value);
                        setIsAutoTime(false);
                      }}
                      required
                      className="w-full bg-white text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold text-slate-800"
                    />
                  </div>
                </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status Presensi {status === 'Terlambat' && `(Terlambat ${lateMinutes} Mnt)`}
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
                  className={`w-full text-xs p-2 border rounded-lg font-bold outline-none ${
                    status === 'Hadir'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : status === 'Terlambat'
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : status === 'Alpa'
                      ? 'bg-rose-50 text-rose-800 border-rose-300'
                      : 'bg-blue-50 text-blue-800 border-blue-300'
                  }`}
                >
                  <option value="Hadir">Hadir (Tepat Waktu)</option>
                  <option value="Terlambat">Terlambat</option>
                  <option value="Izin">Izin</option>
                  <option value="Sakit">Sakit</option>
                  <option value="Alpa">Alpa (Tanpa Keterangan)</option>
                </select>
              </div>
            </div>
          </div>

            {/* 4. Notes / Keterangan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Catatan / Keterangan Tambahan (Opsional):
              </label>
              <textarea
                rows={2}
                placeholder="Tuliskan keterangan jika izin, sakit, atau catatan halaqah / kegiatan..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white text-xs p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onDone}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Tutup
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-amber-300" />
                Simpan Presensi
              </button>
            </div>
          </form>
        ) : (
          /* QR Code Tab */
          <div className="p-6 text-center space-y-6">
            <div className="max-w-md mx-auto space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border-2 border-dashed border-slate-200 relative">
                <div id="qr-reader" className="w-full rounded-xl overflow-hidden min-h-[220px]"></div>

                {!qrScanning && (
                  <div className="py-8 space-y-3">
                    <Camera className="w-12 h-12 mx-auto text-emerald-800" />
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Pemindai Kamera QR Code</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Arahkan kamera ke Kartu QR Code Guru / QR Kegiatan Pondok
                      </p>
                    </div>

                    <button
                      onClick={startScanner}
                      className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs transition inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-amber-300" />
                      Aktifkan Kamera
                    </button>
                  </div>
                )}
              </div>

              {qrError && (
                <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200 flex items-center gap-2 text-left">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{qrError}</span>
                </div>
              )}

              {/* Quick Simulator Buttons for Demo Testing */}
              <div className="pt-4 border-t border-slate-200">
                <p className="text-xs font-bold text-slate-500 mb-2">Simulasi Scan Cepat QR Guru:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {teachers.slice(0, 3).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleQrDecoded(t.nip)}
                      className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium px-3 py-1.5 rounded-lg border border-slate-200 transition cursor-pointer"
                    >
                      Scan {t.name.split(',')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
