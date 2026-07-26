import React, { useState, useEffect } from 'react';
import { 
  Teacher, 
  ActivitySchedule, 
  PrayerScheduleInfo,
  PrayerTime,
  PRAYER_SCHEDULES, 
  TasmiScheduleInfo,
  TasmiTime,
  TASMI_SCHEDULES,
  BimbinganScheduleInfo,
  BimbinganTime,
  BIMBINGAN_SCHEDULES, 
  EkstraScheduleInfo,
  EkstraOption,
  EKSTRA_OPTIONS, 
  KEGIATAN_LAINNYA_PRESETS,
  KegiatanLainnyaPreset 
} from '../types';
import { INITIAL_SCHEDULES } from '../data/initialData';
import { QRCodeSVG } from 'qrcode.react';
import { Logo } from './Logo';
import { StorageService } from '../utils/storage';
import { 
  Users, 
  Plus, 
  QrCode, 
  Edit3, 
  Trash2, 
  Printer, 
  Clock, 
  Building2, 
  Phone, 
  Search, 
  X, 
  Check, 
  BookOpen, 
  GraduationCap, 
  Sun, 
  Calendar,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  Settings,
  Sparkles
} from 'lucide-react';

interface TeacherManagementProps {
  teachers: Teacher[];
  schedules: ActivitySchedule[];
  onAddTeacher: (teacher: Omit<Teacher, 'id'>) => void;
  onUpdateTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (id: string) => void;
  onUpdateSchedules: (schedules: ActivitySchedule[]) => void;
}

export const TeacherManagement: React.FC<TeacherManagementProps> = ({
  teachers,
  schedules,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
  onUpdateSchedules,
}) => {
  const [activeTab, setActiveTab] = useState<'teachers' | 'schedules' | 'cards' | 'logo'>('teachers');
  const [search, setSearch] = useState('');
  
  // Custom Logo State
  const [currentLogo, setCurrentLogo] = useState<string | null>(null);
  const [logoUrlInput, setLogoUrlInput] = useState<string>('');
  const [logoSaveSuccess, setLogoSaveSuccess] = useState<boolean>(false);

  // Sub-schedules editable state
  const [prayers, setPrayers] = useState<PrayerScheduleInfo[]>([]);
  const [tasmis, setTasmis] = useState<TasmiScheduleInfo[]>([]);
  const [bimbingans, setBimbingans] = useState<BimbinganScheduleInfo[]>([]);
  const [ekstras, setEkstras] = useState<EkstraScheduleInfo[]>([]);
  const [kegiatanPresets, setKegiatanPresets] = useState<{ name: KegiatanLainnyaPreset; label: string; defaultTime: string }[]>([]);
  const [scheduleSaveToast, setScheduleSaveToast] = useState<boolean>(false);

  useEffect(() => {
    setCurrentLogo(StorageService.getCustomLogo());
    setPrayers(StorageService.getPrayerSchedules());
    setTasmis(StorageService.getTasmiSchedules());
    setBimbingans(StorageService.getBimbinganSchedules());
    setEkstras(StorageService.getEkstraSchedules());
    setKegiatanPresets(StorageService.getKegiatanLainnyaPresets());
  }, []);

  const triggerScheduleToast = () => {
    setScheduleSaveToast(true);
    setTimeout(() => setScheduleSaveToast(false), 2500);
  };

  const handlePrayerTimeChange = (pName: PrayerTime, newTime: string) => {
    const updated = prayers.map((p) => (p.name === pName ? { ...p, defaultTime: newTime } : p));
    setPrayers(updated);
    StorageService.savePrayerSchedules(updated);
    triggerScheduleToast();
  };

  const handleTasmiTimeChange = (tName: TasmiTime, newTime: string) => {
    const updated = tasmis.map((t) => (t.name === tName ? { ...t, defaultTime: newTime } : t));
    setTasmis(updated);
    StorageService.saveTasmiSchedules(updated);
    triggerScheduleToast();
  };

  const handleBimbinganTimeChange = (bName: BimbinganTime, newTime: string) => {
    const updated = bimbingans.map((b) => (b.name === bName ? { ...b, defaultTime: newTime } : b));
    setBimbingans(updated);
    StorageService.saveBimbinganSchedules(updated);
    triggerScheduleToast();
  };

  const handleEkstraTimeChange = (eName: EkstraOption, newTime: string) => {
    const updated = ekstras.map((e) => (e.name === eName ? { ...e, defaultTime: newTime } : e));
    setEkstras(updated);
    StorageService.saveEkstraSchedules(updated);
    triggerScheduleToast();
  };

  const handleKegiatanPresetTimeChange = (kName: KegiatanLainnyaPreset, newTime: string) => {
    const updated = kegiatanPresets.map((k) => (k.name === kName ? { ...k, defaultTime: newTime } : k));
    setKegiatanPresets(updated);
    StorageService.saveKegiatanLainnyaPresets(updated);
    triggerScheduleToast();
  };

  const handleResetAllSchedules = () => {
    if (confirm('Kembalikan SEMUA jam target kegiatan dan toleransi ke pengaturan standar awal pesantren?')) {
      localStorage.removeItem('yasfi_schedules_v1');
      localStorage.removeItem('yasfi_prayer_times_v1');
      localStorage.removeItem('yasfi_tasmi_times_v1');
      localStorage.removeItem('yasfi_bimbingan_times_v1');
      localStorage.removeItem('yasfi_ekstra_times_v1');
      localStorage.removeItem('yasfi_kegiatan_presets_v1');

      onUpdateSchedules(INITIAL_SCHEDULES);
      setPrayers(PRAYER_SCHEDULES);
      setTasmis(TASMI_SCHEDULES);
      setBimbingans(BIMBINGAN_SCHEDULES);
      setEkstras(EKSTRA_OPTIONS);
      setKegiatanPresets(KEGIATAN_LAINNYA_PRESETS);

      window.dispatchEvent(new Event('yasfi_schedules_updated'));
      triggerScheduleToast();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file terlalu besar! Maksimal 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        StorageService.saveCustomLogo(result);
        setCurrentLogo(result);
        setLogoSaveSuccess(true);
        setTimeout(() => setLogoSaveSuccess(false), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveLogoUrl = () => {
    if (!logoUrlInput.trim()) {
      alert('Masukkan URL gambar logo terlebih dahulu!');
      return;
    }
    StorageService.saveCustomLogo(logoUrlInput.trim());
    setCurrentLogo(logoUrlInput.trim());
    setLogoUrlInput('');
    setLogoSaveSuccess(true);
    setTimeout(() => setLogoSaveSuccess(false), 3000);
  };

  const handleResetLogo = () => {
    if (confirm('Kembalikan logo ke Stempel Vektor Resmi Pesantren?')) {
      StorageService.saveCustomLogo(null);
      setCurrentLogo(null);
      setLogoUrlInput('');
      setLogoSaveSuccess(true);
      setTimeout(() => setLogoSaveSuccess(false), 3000);
    }
  };
  
  // Modal State for Teacher
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formNip, setFormNip] = useState('');
  const [formName, setFormName] = useState('');
  const [formGender, setFormGender] = useState<'L' | 'P'>('L');
  const [formRole, setFormRole] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAvatarUrl, setFormAvatarUrl] = useState<string | undefined>('');

  // Selected Teacher for Card Preview
  const [selectedCardTeacher, setSelectedCardTeacher] = useState<Teacher | null>(
    teachers[0] || null
  );

  const openAddModal = () => {
    setEditingTeacher(null);
    setFormNip(`YASFI.${new Date().getFullYear()}.${String(teachers.length + 1).padStart(3, '0')}`);
    setFormName('');
    setFormGender('L');
    setFormRole('Pengajar & Musyrif');
    setFormPhone('6281234567890');
    setFormAvatarUrl('');
    setShowTeacherModal(true);
  };

  const openEditModal = (t: Teacher) => {
    setEditingTeacher(t);
    setFormNip(t.nip);
    setFormName(t.name);
    setFormGender(t.gender);
    setFormRole(t.role);
    setFormPhone(t.phone);
    setFormAvatarUrl(t.avatarUrl || '');
    setShowTeacherModal(true);
  };

  const handleTeacherPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file foto terlalu besar! Maksimal 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setFormAvatarUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formNip.trim()) {
      alert('Isi NIP dan Nama Guru!');
      return;
    }

    if (editingTeacher) {
      onUpdateTeacher({
        ...editingTeacher,
        nip: formNip,
        name: formName,
        gender: formGender,
        role: formRole,
        phone: formPhone,
        avatarUrl: formAvatarUrl || undefined,
      });
    } else {
      onAddTeacher({
        nip: formNip,
        name: formName,
        gender: formGender,
        role: formRole,
        phone: formPhone,
        avatarUrl: formAvatarUrl || undefined,
      });
    }

    setShowTeacherModal(false);
  };

  const handleScheduleTimeChange = (id: string, time: string) => {
    const updated = schedules.map((s) => (s.id === id ? { ...s, defaultTime: time } : s));
    onUpdateSchedules(updated);
    triggerScheduleToast();
  };

  const handleScheduleToleranceChange = (id: string, tol: number) => {
    const updated = schedules.map((s) =>
      s.id === id ? { ...s, lateToleranceMinutes: tol } : s
    );
    onUpdateSchedules(updated);
    triggerScheduleToast();
  };

  const filteredTeachers = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.nip.toLowerCase().includes(search.toLowerCase()) ||
      t.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-950 p-5 md:p-6 rounded-2xl text-white border border-emerald-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-amber-400 text-emerald-950 font-bold text-[10px] uppercase px-3 py-0.5 rounded-full mb-2">
            <Users className="w-3.5 h-3.5" /> MASTER DATA PESANTREN
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">Data Guru, Musyrif & Jadwal Kegiatan</h2>
          <p className="text-xs text-emerald-200 mt-0.5">
            Kelola profil ustaz/ustazah, cetak kartu ID bertandakan QR Code, dan atur toleransi jadwal
          </p>
        </div>

        {/* Sub Tabs */}
        <div className="bg-emerald-950/80 p-1 rounded-xl border border-emerald-800/80 flex items-center gap-1">
          <button
            onClick={() => setActiveTab('teachers')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'teachers'
                ? 'bg-amber-400 text-emerald-950 shadow-xs'
                : 'text-emerald-100 hover:text-white'
            }`}
          >
            Data Guru ({teachers.length})
          </button>
          <button
            onClick={() => setActiveTab('cards')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'cards'
                ? 'bg-amber-400 text-emerald-950 shadow-xs'
                : 'text-emerald-100 hover:text-white'
            }`}
          >
            Kartu QR Guru
          </button>
          <button
            onClick={() => setActiveTab('schedules')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'schedules'
                ? 'bg-amber-400 text-emerald-950 shadow-xs'
                : 'text-emerald-100 hover:text-white'
            }`}
          >
            Atur Jadwal
          </button>
          <button
            onClick={() => setActiveTab('logo')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'logo'
                ? 'bg-amber-400 text-emerald-950 shadow-xs'
                : 'text-emerald-100 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Pengaturan Logo
          </button>
        </div>
      </div>

      {/* Tab 1: Data Guru List */}
      {activeTab === 'teachers' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari NIP / Nama Guru / Role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600 text-slate-800"
              />
            </div>

            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              Tambah Guru Baru
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F5F0] text-[#1B3022] font-serif font-bold uppercase tracking-wider border-b border-[#EAE2D6]">
                <tr>
                  <th className="py-3 px-4">No</th>
                  <th className="py-3 px-4">NIP / ID</th>
                  <th className="py-3 px-4">Nama Guru / Musyrif</th>
                  <th className="py-3 px-4">Gender</th>
                  <th className="py-3 px-4">Jabatan / Role</th>
                  <th className="py-3 px-4">No. WhatsApp</th>
                  <th className="py-3 px-4 text-center">QR Code</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2EFE9]">
                {filteredTeachers.map((t, idx) => (
                  <tr key={t.id} className="hover:bg-[#FDFBF9] transition">
                    <td className="py-3 px-4 font-mono text-[#8A9A8A]">{idx + 1}</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#1B3022]">{t.nip}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {t.avatarUrl ? (
                          <img
                            src={t.avatarUrl}
                            alt={t.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-emerald-700 shrink-0 shadow-xs"
                          />
                        ) : (
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              t.gender === 'L'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {t.gender === 'L' ? 'Ust' : 'Usth'}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-[#1B3022] text-xs">{t.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{t.nip}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          t.gender === 'L'
                            ? 'bg-[#2D4536]/10 text-[#2D4536] border border-[#2D4536]/20'
                            : 'bg-[#D4AF37]/20 text-[#1B3022] border border-[#D4AF37]/40'
                        }`}
                      >
                        {t.gender === 'L' ? 'Ustadz (L)' : 'Ustadzah (P)'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#4A5D4A] font-medium">{t.role}</td>
                    <td className="py-3 px-4 font-mono text-[#4A5D4A]">+{t.phone}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedCardTeacher(t);
                          setActiveTab('cards');
                        }}
                        className="p-1.5 bg-[#F8F5F0] hover:bg-[#EAE2D6] text-[#1B3022] rounded-lg transition inline-flex items-center gap-1 text-[10px] font-bold border border-[#EAE2D6] cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5 text-[#2D4536]" /> Lihat QR
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(t)}
                          className="p-1.5 bg-[#F8F5F0] hover:bg-[#EAE2D6] text-[#2D3E40] rounded-lg transition border border-[#EAE2D6] cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus data ${t.name}?`)) {
                              onDeleteTeacher(t.id);
                            }
                          }}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Printable Teacher ID Cards */}
      {activeTab === 'cards' && selectedCardTeacher && (
        <div className="bg-white rounded-2xl border border-[#EAE2D6] shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#EAE2D6] pb-4">
            <div>
              <h3 className="text-base font-serif font-bold text-[#1B3022]">
                Kartu Anggota Presensi Guru / Musyrif
              </h3>
              <p className="text-xs text-[#8A9A8A]">
                Pilih guru untuk menampilkan kartu QR Code siap cetak
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedCardTeacher.id}
                onChange={(e) => {
                  const t = teachers.find((x) => x.id === e.target.value);
                  if (t) setSelectedCardTeacher(t);
                }}
                className="bg-[#F8F5F0] text-xs font-bold p-2 border border-[#EAE2D6] rounded-xl outline-none text-[#2D3E40]"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.nip})
                  </option>
                ))}
              </select>

              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#1B3022] hover:bg-[#2D4536] text-white text-xs font-bold rounded-xl shadow-xs transition inline-flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#D4AF37]" /> Cetak Kartu
              </button>
            </div>
          </div>

          {/* ID Card Graphic Container */}
          <div className="max-w-sm mx-auto bg-[#1B3022] p-6 rounded-3xl text-white shadow-xl border-4 border-[#D4AF37] space-y-4 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none"></div>

            <Logo variant="compact" size="sm" showText={false} className="mx-auto" />
            <div className="text-[10px] font-bold text-[#D4AF37] tracking-wider uppercase font-serif">
              PONDOK PESANTREN TAHFIDZ YASFI SHIGOR
            </div>

            {/* Photo Avatar on ID Card */}
            <div className="pt-1">
              {selectedCardTeacher.avatarUrl ? (
                <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-[#D4AF37] shadow-md bg-white p-0.5">
                  <img
                    src={selectedCardTeacher.avatarUrl}
                    alt={selectedCardTeacher.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 mx-auto rounded-full bg-[#2D4536] border-2 border-[#D4AF37] flex items-center justify-center text-[#D4AF37] font-bold text-sm shadow-inner">
                  {selectedCardTeacher.gender === 'L' ? 'Ustadz' : 'Ustadzah'}
                </div>
              )}
            </div>

            <div className="bg-white p-3 rounded-2xl w-36 h-36 mx-auto shadow-inner flex items-center justify-center">
              <QRCodeSVG
                value={selectedCardTeacher.nip}
                size={120}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="space-y-1">
              <h4 className="font-serif font-extrabold text-base tracking-tight">{selectedCardTeacher.name}</h4>
              <p className="text-xs text-[#D4AF37] font-mono font-bold">{selectedCardTeacher.nip}</p>
              <p className="text-[11px] text-[#E9E0D2] font-medium">{selectedCardTeacher.role}</p>
            </div>

            <div className="pt-2 border-t border-[#2D4536] text-[9px] text-[#8A9A8A] uppercase tracking-widest">
              KARTU PRESENSI RESMI GURU
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Activity Schedules & Tolerances */}
      {activeTab === 'schedules' && (
        <div className="bg-white rounded-2xl border border-[#EAE2D6] shadow-xs p-6 space-y-6">
          {scheduleSaveToast && (
            <div className="bg-emerald-900 text-white p-3.5 rounded-xl border border-amber-400 flex items-center justify-between gap-2 font-bold text-xs animate-fade-in">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-300" />
                <span>Pengaturan Jadwal Berhasil Diperbarui & Tersimpan Otomatis!</span>
              </div>
              <span className="text-[10px] text-emerald-200 font-normal">Tersinkron ke Seluruh Sistem</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-serif font-bold text-[#1B3022] flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-800" />
                Pengaturan Waktu Jadwal & Toleransi Keterlambatan
              </h3>
              <p className="text-xs text-[#8A9A8A] mt-0.5">
                Ubah target jam pelaksanaan kegiatan utama, sholat 5 waktu, bimbingan, ekstrakulikuler, dan kegiatan lainnya.
              </p>
            </div>

            <button
              type="button"
              onClick={handleResetAllSchedules}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-300 hover:border-rose-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
              <span>Reset Ke Waktu Standar</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {schedules.map((sch) => (
              <div
                key={sch.id}
                className="p-4.5 rounded-2xl border border-[#EAE2D6] bg-[#F8F5F0] space-y-4 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-[#1B3022] text-sm flex items-center gap-2">
                    <Clock className="w-4.5 h-4.5 text-emerald-800" />
                    {sch.name}
                  </h4>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-800 text-amber-300 border border-emerald-900">
                    Kategori Resmi
                  </span>
                </div>

                <p className="text-xs text-[#4A5D4A] leading-relaxed">{sch.description}</p>

                {/* Sub-breakdown for Sholat Berjamaah */}
                {sch.id === 'Sholat Berjamaah' && (
                  <div className="bg-gradient-to-r from-emerald-950 to-teal-950 text-white p-3.5 rounded-xl space-y-2.5 border border-emerald-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" /> Atur Jam Sholat 5 Waktu:
                      </span>
                      <span className="text-[10px] text-emerald-300 font-mono bg-emerald-900/80 px-2 py-0.5 rounded">
                        Semua Bisa Diubah
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-center text-xs">
                      {(prayers.length ? prayers : PRAYER_SCHEDULES).map((p) => (
                        <div key={p.name} className="bg-emerald-900/80 p-2 rounded-lg border border-emerald-800 flex flex-col items-center">
                          <div className="font-extrabold text-amber-300 text-[11px] mb-1">{p.name}</div>
                          <input
                            type="time"
                            value={p.defaultTime}
                            onChange={(e) => handlePrayerTimeChange(p.name, e.target.value)}
                            className="w-full bg-emerald-950 text-amber-200 font-mono text-[11px] font-bold p-1 rounded border border-emerald-700 text-center outline-none focus:ring-1 focus:ring-amber-400"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-breakdown for Tasmi */}
                {sch.id === 'Tasmi' && (
                  <div className="bg-gradient-to-r from-emerald-950 to-teal-950 text-white p-3.5 rounded-xl space-y-2.5 border border-emerald-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-amber-400" /> Atur Jam Tasmi Al-Qur'an:
                      </span>
                      <span className="text-[10px] text-emerald-300 font-mono bg-emerald-900/80 px-2 py-0.5 rounded">
                        Subuh, Ashar, Isya
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
                      {(tasmis.length ? tasmis : TASMI_SCHEDULES).map((t) => (
                        <div key={t.name} className="bg-emerald-900/80 p-2 rounded-lg border border-emerald-800 flex flex-col items-center">
                          <div className="font-extrabold text-amber-300 text-[11px] mb-1">Tasmi {t.name}</div>
                          <input
                            type="time"
                            value={t.defaultTime}
                            onChange={(e) => handleTasmiTimeChange(t.name, e.target.value)}
                            className="w-full bg-emerald-950 text-amber-200 font-mono text-[11px] font-bold p-1 rounded border border-emerald-700 text-center outline-none focus:ring-1 focus:ring-amber-400"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-breakdown for Bimbingan */}
                {sch.id === 'Bimbingan' && (
                  <div className="bg-gradient-to-r from-emerald-950 to-teal-950 text-white p-3.5 rounded-xl space-y-2.5 border border-emerald-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" /> Atur Jam Bimbingan & KBM:
                      </span>
                      <span className="text-[10px] text-emerald-300 font-mono bg-emerald-900/80 px-2 py-0.5 rounded">
                        3 Waktu Utama
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
                      {(bimbingans.length ? bimbingans : BIMBINGAN_SCHEDULES).map((b) => (
                        <div key={b.name} className="bg-emerald-900/80 p-2 rounded-lg border border-emerald-800 flex flex-col items-center">
                          <div className="font-extrabold text-amber-300 text-[11px] mb-1">Bimbingan {b.name}</div>
                          <input
                            type="time"
                            value={b.defaultTime}
                            onChange={(e) => handleBimbinganTimeChange(b.name, e.target.value)}
                            className="w-full bg-emerald-950 text-amber-200 font-mono text-[11px] font-bold p-1 rounded border border-emerald-700 text-center outline-none focus:ring-1 focus:ring-amber-400"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-breakdown for Ekstrakulikuler */}
                {sch.id === 'Ekstrakulikuler' && (
                  <div className="bg-gradient-to-r from-emerald-950 to-teal-950 text-white p-3.5 rounded-xl space-y-2.5 border border-emerald-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5 text-amber-400" /> Atur Jam 8 Cabang Ekstrakulikuler:
                      </span>
                      <span className="text-[10px] text-emerald-300 font-mono bg-emerald-900/80 px-2 py-0.5 rounded">
                        Ekskul & Minat Bakat
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center text-xs">
                      {(ekstras.length ? ekstras : EKSTRA_OPTIONS).map((e) => (
                        <div key={e.name} className="bg-emerald-900/80 p-2 rounded-lg border border-emerald-800 flex flex-col items-center">
                          <div className="font-extrabold text-amber-300 text-[11px] mb-1 truncate w-full">{e.name}</div>
                          <input
                            type="time"
                            value={e.defaultTime}
                            onChange={(e) => handleEkstraTimeChange(e.name, e.target.value)}
                            className="w-full bg-emerald-950 text-amber-200 font-mono text-[11px] font-bold p-1 rounded border border-emerald-700 text-center outline-none focus:ring-1 focus:ring-amber-400"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-breakdown for Kegiatan Lainnya */}
                {sch.id === 'Kegiatan Lainnya' && (
                  <div className="bg-gradient-to-r from-emerald-950 to-teal-950 text-white p-3.5 rounded-xl space-y-2.5 border border-emerald-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Atur Jam Preset Kegiatan Lainnya:
                      </span>
                      <span className="text-[10px] text-emerald-300 font-mono bg-emerald-900/80 px-2 py-0.5 rounded">
                        Preset Khusus
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 pt-1 text-center text-xs">
                      {(kegiatanPresets.length ? kegiatanPresets : KEGIATAN_LAINNYA_PRESETS).map((p) => (
                        <div key={p.name} className="bg-emerald-900/80 p-2 rounded-lg border border-emerald-800 flex flex-col items-center">
                          <div className="font-extrabold text-amber-300 text-[11px] mb-1 truncate w-full" title={p.name}>{p.name}</div>
                          <input
                            type="time"
                            value={p.defaultTime}
                            onChange={(e) => handleKegiatanPresetTimeChange(p.name, e.target.value)}
                            className="w-full bg-emerald-950 text-amber-200 font-mono text-[11px] font-bold p-1 rounded border border-emerald-700 text-center outline-none focus:ring-1 focus:ring-amber-400"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-[#EAE2D6]">
                  <div>
                    <label className="block text-[11px] font-bold text-[#2D3E40] mb-1">
                      Toleransi Keterlambatan (Batas Keterlambatan):
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        max={120}
                        value={sch.lateToleranceMinutes}
                        onChange={(e) =>
                          handleScheduleToleranceChange(sch.id, parseInt(e.target.value) || 0)
                        }
                        className="w-full bg-white text-xs font-bold p-2 pr-12 border border-[#EAE2D6] rounded-lg outline-none focus:ring-2 focus:ring-[#2D4536] text-[#2D3E40]"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                        menit
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Pengaturan Logo Manual */}
      {activeTab === 'logo' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          {logoSaveSuccess && (
            <div className="bg-emerald-900 text-white p-3.5 rounded-xl border border-amber-400 flex items-center gap-2 font-bold text-xs">
              <Check className="w-4 h-4 text-amber-300" />
              Perubahan Logo Pesantren Berhasil Disimpan & Diperbarui di Seluruh Aplikasi!
            </div>
          )}

          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-emerald-800" />
              Pengaturan Custom Logo Pesantren
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ubah logo institusi secara manual dengan mengunggah berkas gambar (PNG/JPG/SVG/WEBP) atau menggunakan URL gambar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Upload & URL Form */}
            <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-xs uppercase text-slate-700 tracking-wider">
                1. Unggah Gambar Logo Baru
              </h4>

              {/* Upload Box */}
              <label className="border-2 border-dashed border-emerald-700/40 hover:border-emerald-700 bg-white p-6 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition group">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-800">
                  Klik untuk Pilih Gambar dari Perangkat
                </span>
                <span className="text-[10px] text-slate-400 mt-1">
                  Format disarankan: PNG Transparan, JPG, SVG, atau WEBP (Maks 5MB)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="shrink-0 mx-3 text-[10px] uppercase font-bold text-slate-400">
                  atau gunakan URL gambar
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* URL Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Tautan / Link Gambar Logo:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://domain.com/logo.png"
                    value={logoUrlInput}
                    onChange={(e) => setLogoUrlInput(e.target.value)}
                    className="flex-1 bg-white text-xs p-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-700 font-mono text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={handleSaveLogoUrl}
                    className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer shrink-0"
                  >
                    Simpan URL
                  </button>
                </div>
              </div>

              {/* Reset Button */}
              <div className="pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleResetLogo}
                  className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs py-2.5 px-4 rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Kembalikan ke Stempel Vektor Resmi Pesantren
                </button>
              </div>
            </div>

            {/* Right: Live Preview */}
            <div className="space-y-4 bg-gradient-to-br from-emerald-950 to-teal-950 p-6 rounded-2xl text-white border border-emerald-800 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-amber-400 text-emerald-950 font-bold text-[10px] uppercase px-3 py-0.5 rounded-full mb-3">
                  <Sparkles className="w-3.5 h-3.5" /> LIVE PREVIEW LOGO
                </div>
                <h4 className="font-bold text-sm text-white">Pratinjau Tampilan Logo di Aplikasi</h4>
                <p className="text-xs text-emerald-200 mt-0.5">
                  Berikut tampilan logo yang sedang aktif di Header, Kartu ID, dan Laporan:
                </p>

                {/* Preview Variants */}
                <div className="mt-6 space-y-6">
                  {/* Full Header Preview */}
                  <div className="bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur-xs flex items-center justify-center">
                    <Logo variant="full" size="md" />
                  </div>

                  {/* Compact Header Preview */}
                  <div className="bg-white/10 p-3 rounded-xl border border-white/20 backdrop-blur-xs flex items-center justify-between">
                    <span className="text-[11px] text-emerald-200 font-bold">Header Bar:</span>
                    <Logo variant="compact" size="sm" />
                  </div>

                  {/* Icon Only Preview */}
                  <div className="bg-white/10 p-3 rounded-xl border border-white/20 backdrop-blur-xs flex items-center justify-between">
                    <span className="text-[11px] text-emerald-200 font-bold">Ikon Laporan:</span>
                    <Logo variant="icon" size="sm" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-emerald-800/80 text-[11px] text-emerald-300/80 italic text-center">
                * Logo yang disimpan akan otomatis disinkronkan ke seluruh bagian aplikasi secara real-time.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add/Edit Teacher */}
      {showTeacherModal && (
        <div className="fixed inset-0 z-50 bg-[#1B3022]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#EAE2D6] w-full max-w-md overflow-hidden animate-in fade-in">
            <div className="bg-[#1B3022] text-white p-4 flex items-center justify-between border-b border-[#2D4536]">
              <h3 className="font-serif font-bold text-sm text-[#E9E0D2]">
                {editingTeacher ? 'Edit Data Guru' : 'Tambah Guru / Musyrif Baru'}
              </h3>
              <button
                onClick={() => setShowTeacherModal(false)}
                className="p-1 hover:bg-[#2D4536] rounded-lg text-[#8A9A8A] hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeacher} className="p-5 space-y-4">
              {/* Foto Profil Guru */}
              <div className="flex items-center gap-4 p-3 bg-[#F8F5F0] rounded-2xl border border-[#EAE2D6]">
                <div className="relative shrink-0">
                  {formAvatarUrl ? (
                    <img
                      src={formAvatarUrl}
                      alt="Foto Guru"
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#1B3022] shadow-xs"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-900 font-extrabold text-sm flex items-center justify-center border-2 border-emerald-300">
                      {formGender === 'L' ? 'Ust' : 'Usth'}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 flex-1">
                  <label className="block text-xs font-bold text-[#1B3022]">
                    Foto Profil Guru / Musyrif
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="px-3 py-1.5 bg-[#1B3022] hover:bg-[#2D4536] text-white text-[11px] font-bold rounded-xl cursor-pointer transition inline-flex items-center gap-1.5 shadow-xs">
                      <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
                      {formAvatarUrl ? 'Ganti Foto' : 'Unggah Foto'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleTeacherPhotoUpload}
                        className="hidden"
                      />
                    </label>
                    {formAvatarUrl && (
                      <button
                        type="button"
                        onClick={() => setFormAvatarUrl('')}
                        className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[11px] font-bold rounded-xl transition cursor-pointer"
                      >
                        Hapus Foto
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400">Format: PNG, JPG, WEBP (Maks 5MB)</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A5D4A] mb-1">
                  NIP / ID Pesantren
                </label>
                <input
                  type="text"
                  value={formNip}
                  onChange={(e) => setFormNip(e.target.value)}
                  required
                  className="w-full bg-[#F8F5F0] text-xs font-mono font-bold p-2.5 border border-[#EAE2D6] rounded-xl outline-none focus:ring-2 focus:ring-[#2D4536] text-[#2D3E40]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A5D4A] mb-1">
                  Nama Lengkap & Gelar
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Ustadz Ahmad Fauzi, S.Pd.I"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  className="w-full text-xs font-semibold p-2.5 border border-[#EAE2D6] rounded-xl outline-none focus:ring-2 focus:ring-[#2D4536] text-[#2D3E40]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A5D4A] mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as 'L' | 'P')}
                    className="w-full text-xs font-bold p-2.5 border border-[#EAE2D6] rounded-xl outline-none focus:ring-2 focus:ring-[#2D4536] text-[#2D3E40]"
                  >
                    <option value="L">Ustadz (L)</option>
                    <option value="P">Ustadzah (P)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A5D4A] mb-1">
                    Jabatan / Role
                  </label>
                  <input
                    type="text"
                    placeholder="Musyrif Tahfidz, Guru, etc."
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 border border-[#EAE2D6] rounded-xl outline-none focus:ring-2 focus:ring-[#2D4536] text-[#2D3E40]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A5D4A] mb-1">
                  No. WhatsApp (Gunakan Format 628...)
                </label>
                <input
                  type="text"
                  placeholder="6281234567890"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  required
                  className="w-full font-mono text-xs p-2.5 border border-[#EAE2D6] rounded-xl outline-none focus:ring-2 focus:ring-[#2D4536] text-[#2D3E40]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EAE2D6]">
                <button
                  type="button"
                  onClick={() => setShowTeacherModal(false)}
                  className="px-4 py-2 bg-[#F8F5F0] hover:bg-[#EAE2D6] text-[#2D3E40] text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1B3022] hover:bg-[#2D4536] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
