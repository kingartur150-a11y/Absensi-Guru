export type ActivityCategory = 
  | 'Tasmi'
  | 'Bimbingan'
  | 'Sholat Berjamaah'
  | 'Sholat Duha'
  | 'Ekstrakulikuler'
  | 'Kegiatan Lainnya';

export type PrayerTime = 'Subuh' | 'Zuhur' | 'Ashar' | 'Maghrib' | 'Isya';

export interface PrayerScheduleInfo {
  name: PrayerTime;
  defaultTime: string;
  label: string;
}

export const PRAYER_SCHEDULES: PrayerScheduleInfo[] = [
  { name: 'Subuh', defaultTime: '04:30', label: 'Sholat Subuh Berjamaah' },
  { name: 'Zuhur', defaultTime: '12:00', label: 'Sholat Zuhur Berjamaah' },
  { name: 'Ashar', defaultTime: '15:30', label: 'Sholat Ashar Berjamaah' },
  { name: 'Maghrib', defaultTime: '18:00', label: 'Sholat Maghrib Berjamaah' },
  { name: 'Isya', defaultTime: '19:15', label: 'Sholat Isya Berjamaah' },
];

export type TasmiTime = 'Subuh' | 'Ashar' | 'Isya';

export interface TasmiScheduleInfo {
  name: TasmiTime;
  defaultTime: string;
  label: string;
}

export const TASMI_SCHEDULES: TasmiScheduleInfo[] = [
  { name: 'Subuh', defaultTime: '05:30', label: 'Tasmi Subuh' },
  { name: 'Ashar', defaultTime: '16:00', label: 'Tasmi Ashar' },
  { name: 'Isya', defaultTime: '20:00', label: 'Tasmi Isya' },
];

export type BimbinganTime = 'Subuh' | 'Ashar' | 'Isya';

export interface BimbinganScheduleInfo {
  name: BimbinganTime;
  defaultTime: string;
  label: string;
}

export const BIMBINGAN_SCHEDULES: BimbinganScheduleInfo[] = [
  { name: 'Subuh', defaultTime: '05:30', label: 'Bimbingan Subuh' },
  { name: 'Ashar', defaultTime: '16:00', label: 'Bimbingan Ashar' },
  { name: 'Isya', defaultTime: '20:00', label: 'Bimbingan Isya' },
];

export type EkstraOption = 
  | 'Komputer'
  | 'Badminton'
  | 'Paduan Suara'
  | 'Tata Boga'
  | 'Ceramah'
  | 'Hadroh'
  | 'Hasta Karya'
  | 'Futsal';

export interface EkstraScheduleInfo {
  name: EkstraOption;
  label: string;
  defaultTime: string;
}

export const EKSTRA_OPTIONS: EkstraScheduleInfo[] = [
  { name: 'Komputer', label: 'Ekskul Komputer', defaultTime: '16:00' },
  { name: 'Badminton', label: 'Ekskul Badminton', defaultTime: '16:00' },
  { name: 'Paduan Suara', label: 'Ekskul Paduan Suara', defaultTime: '16:00' },
  { name: 'Tata Boga', label: 'Ekskul Tata Boga', defaultTime: '16:00' },
  { name: 'Ceramah', label: 'Ekskul Ceramah', defaultTime: '16:00' },
  { name: 'Hadroh', label: 'Ekskul Hadroh', defaultTime: '16:00' },
  { name: 'Hasta Karya', label: 'Ekskul Hasta Karya', defaultTime: '16:00' },
  { name: 'Futsal', label: 'Ekskul Futsal', defaultTime: '16:00' },
];

export type KegiatanLainnyaPreset = 
  | 'Rapat Bulanan' 
  | 'Ratibul Hadad' 
  | 'Belajar Malam'
  | 'Ekskul Komputer'
  | 'Ekskul Bulu Tangkis'
  | 'Ekskul Paduan Suara'
  | 'Ekskul Tata Boga'
  | 'Ekskul Ceramah'
  | 'Ekskul Hadroh'
  | 'Ekskul Hasta Karya';

export const KEGIATAN_LAINNYA_PRESETS: { name: KegiatanLainnyaPreset; label: string; defaultTime: string }[] = [
  { name: 'Rapat Bulanan', label: 'Rapat Bulanan Pengurus', defaultTime: '19:30' },
  { name: 'Ratibul Hadad', label: 'Ratibul Hadad', defaultTime: '18:30' },
  { name: 'Belajar Malam', label: 'Belajar Malam', defaultTime: '20:00' },
  { name: 'Ekskul Komputer', label: 'Ekskul Komputer', defaultTime: '16:00' },
  { name: 'Ekskul Bulu Tangkis', label: 'Ekskul Bulu Tangkis', defaultTime: '16:00' },
  { name: 'Ekskul Paduan Suara', label: 'Ekskul Paduan Suara', defaultTime: '16:00' },
  { name: 'Ekskul Tata Boga', label: 'Ekskul Tata Boga', defaultTime: '16:00' },
  { name: 'Ekskul Ceramah', label: 'Ekskul Ceramah', defaultTime: '16:00' },
  { name: 'Ekskul Hadroh', label: 'Ekskul Hadroh', defaultTime: '16:00' },
  { name: 'Ekskul Hasta Karya', label: 'Ekskul Hasta Karya', defaultTime: '16:00' },
];

export type AttendanceStatus = 'Hadir' | 'Terlambat' | 'Izin' | 'Sakit' | 'Alpa';

export interface Teacher {
  id: string;
  nip: string;
  name: string;
  gender: 'L' | 'P'; // L: Ustadz, P: Ustadzah
  role: string; // e.g. Musyrif Tahfidz, Pengajar, Wali Kelas
  phone: string; // WhatsApp number, e.g. "628123456789"
  avatarUrl?: string;
}

export interface ActivitySchedule {
  id: ActivityCategory;
  name: string;
  defaultTime: string; // HH:mm e.g. "04:30" for Subuh
  lateToleranceMinutes: number; // e.g. 10 mins
  description: string;
  iconName: string;
}

export interface AttendanceRecord {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherNip: string;
  activityCategory: ActivityCategory;
  customActivityName?: string; // Used when category is 'Kegiatan Lainnya'
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  status: AttendanceStatus;
  lateMinutes: number; // 0 if on time
  notes?: string;
  method: 'Manual' | 'QR Code';
  createdAt: string; // ISO string
}

export interface DailySummaryStats {
  date: string;
  totalTeachers: number;
  totalPresent: number;
  totalLate: number;
  totalPermitted: number; // Izin + Sakit
  totalAbsent: number; // Alpa
  attendancePercentage: number;
}

export interface WhatsAppNotification {
  id: string;
  recordId: string;
  teacherName: string;
  teacherPhone: string;
  activityName: string;
  date: string;
  time: string;
  lateMinutes: number;
  messageText: string;
  sentAt?: string;
  status: 'Pending' | 'Sent';
}

export interface ReportSignees {
  disciplineOfficerName: string;
  disciplineOfficerTitle: string;
  leaderName: string;
  leaderTitle: string;
  location: string;
}

export const DEFAULT_REPORT_SIGNEES: ReportSignees = {
  disciplineOfficerName: 'Ust. Ahmad Fauzi, S.Pd.I',
  disciplineOfficerTitle: 'Sie. Kedisiplinan Guru',
  leaderName: 'KH. Ahmad Yasfi, Lc., M.A.',
  leaderTitle: 'Pimpinan Pondok Pesantren',
  location: 'Bekasi',
};
