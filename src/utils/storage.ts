import { 
  Teacher, 
  ActivitySchedule, 
  AttendanceRecord, 
  ReportSignees, 
  DEFAULT_REPORT_SIGNEES,
  PrayerScheduleInfo,
  PRAYER_SCHEDULES,
  TasmiScheduleInfo,
  TASMI_SCHEDULES,
  BimbinganScheduleInfo,
  BIMBINGAN_SCHEDULES,
  EkstraScheduleInfo,
  EKSTRA_OPTIONS,
  KEGIATAN_LAINNYA_PRESETS,
  KegiatanLainnyaPreset
} from '../types';
import { INITIAL_TEACHERS, INITIAL_SCHEDULES, getInitialAttendanceRecords } from '../data/initialData';

const KEYS = {
  TEACHERS: 'yasfi_teachers_v1',
  SCHEDULES: 'yasfi_schedules_v1',
  ATTENDANCE: 'yasfi_attendance_v1',
  CUSTOM_LOGO: 'yasfi_custom_logo_v1',
  PRAYER_TIMES: 'yasfi_prayer_times_v1',
  TASMI_TIMES: 'yasfi_tasmi_times_v1',
  BIMBINGAN_TIMES: 'yasfi_bimbingan_times_v1',
  EKSTRA_TIMES: 'yasfi_ekstra_times_v1',
  KEGIATAN_PRESETS: 'yasfi_kegiatan_presets_v1',
  REPORT_SIGNEES: 'yasfi_report_signees_v1',
};

export const StorageService = {
  getReportSignees(): ReportSignees {
    const data = localStorage.getItem(KEYS.REPORT_SIGNEES);
    if (!data) return DEFAULT_REPORT_SIGNEES;
    try {
      return { ...DEFAULT_REPORT_SIGNEES, ...JSON.parse(data) };
    } catch {
      return DEFAULT_REPORT_SIGNEES;
    }
  },

  saveReportSignees(signees: ReportSignees): void {
    localStorage.setItem(KEYS.REPORT_SIGNEES, JSON.stringify(signees));
  },

  getCustomLogo(): string | null {
    return localStorage.getItem(KEYS.CUSTOM_LOGO);
  },

  saveCustomLogo(logoUrlOrBase64: string | null): void {
    if (logoUrlOrBase64) {
      localStorage.setItem(KEYS.CUSTOM_LOGO, logoUrlOrBase64);
    } else {
      localStorage.removeItem(KEYS.CUSTOM_LOGO);
    }
    // Dispatch custom event to notify all Logo components across the app
    window.dispatchEvent(new Event('yasfi_logo_updated'));
  },
  getTeachers(): Teacher[] {
    const data = localStorage.getItem(KEYS.TEACHERS);
    if (!data) {
      localStorage.setItem(KEYS.TEACHERS, JSON.stringify(INITIAL_TEACHERS));
      return INITIAL_TEACHERS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_TEACHERS;
    }
  },

  saveTeachers(teachers: Teacher[]): void {
    localStorage.setItem(KEYS.TEACHERS, JSON.stringify(teachers));
  },

  getSchedules(): ActivitySchedule[] {
    const data = localStorage.getItem(KEYS.SCHEDULES);
    if (!data) {
      localStorage.setItem(KEYS.SCHEDULES, JSON.stringify(INITIAL_SCHEDULES));
      return INITIAL_SCHEDULES;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_SCHEDULES;
    }
  },

  saveSchedules(schedules: ActivitySchedule[]): void {
    localStorage.setItem(KEYS.SCHEDULES, JSON.stringify(schedules));
    window.dispatchEvent(new Event('yasfi_schedules_updated'));
  },

  getPrayerSchedules(): PrayerScheduleInfo[] {
    const data = localStorage.getItem(KEYS.PRAYER_TIMES);
    if (!data) return PRAYER_SCHEDULES;
    try {
      const parsed = JSON.parse(data);
      return PRAYER_SCHEDULES.map((def) => {
        const found = parsed.find((p: any) => p.name === def.name);
        return found ? { ...def, defaultTime: found.defaultTime || def.defaultTime } : def;
      });
    } catch {
      return PRAYER_SCHEDULES;
    }
  },

  savePrayerSchedules(schedules: PrayerScheduleInfo[]): void {
    localStorage.setItem(KEYS.PRAYER_TIMES, JSON.stringify(schedules));
    window.dispatchEvent(new Event('yasfi_schedules_updated'));
  },

  getTasmiSchedules(): TasmiScheduleInfo[] {
    const data = localStorage.getItem(KEYS.TASMI_TIMES);
    if (!data) return TASMI_SCHEDULES;
    try {
      const parsed = JSON.parse(data);
      return TASMI_SCHEDULES.map((def) => {
        const found = parsed.find((t: any) => t.name === def.name);
        return found ? { ...def, defaultTime: found.defaultTime || def.defaultTime } : def;
      });
    } catch {
      return TASMI_SCHEDULES;
    }
  },

  saveTasmiSchedules(schedules: TasmiScheduleInfo[]): void {
    localStorage.setItem(KEYS.TASMI_TIMES, JSON.stringify(schedules));
    window.dispatchEvent(new Event('yasfi_schedules_updated'));
  },

  getBimbinganSchedules(): BimbinganScheduleInfo[] {
    const data = localStorage.getItem(KEYS.BIMBINGAN_TIMES);
    if (!data) return BIMBINGAN_SCHEDULES;
    try {
      const parsed = JSON.parse(data);
      return BIMBINGAN_SCHEDULES.map((def) => {
        const found = parsed.find((b: any) => b.name === def.name);
        return found ? { ...def, defaultTime: found.defaultTime || def.defaultTime } : def;
      });
    } catch {
      return BIMBINGAN_SCHEDULES;
    }
  },

  saveBimbinganSchedules(schedules: BimbinganScheduleInfo[]): void {
    localStorage.setItem(KEYS.BIMBINGAN_TIMES, JSON.stringify(schedules));
    window.dispatchEvent(new Event('yasfi_schedules_updated'));
  },

  getEkstraSchedules(): EkstraScheduleInfo[] {
    const data = localStorage.getItem(KEYS.EKSTRA_TIMES);
    if (!data) return EKSTRA_OPTIONS;
    try {
      const parsed = JSON.parse(data);
      return EKSTRA_OPTIONS.map((def) => {
        const found = parsed.find((e: any) => e.name === def.name);
        return found ? { ...def, defaultTime: found.defaultTime || def.defaultTime } : def;
      });
    } catch {
      return EKSTRA_OPTIONS;
    }
  },

  saveEkstraSchedules(schedules: EkstraScheduleInfo[]): void {
    localStorage.setItem(KEYS.EKSTRA_TIMES, JSON.stringify(schedules));
    window.dispatchEvent(new Event('yasfi_schedules_updated'));
  },

  getKegiatanLainnyaPresets(): { name: KegiatanLainnyaPreset; label: string; defaultTime: string }[] {
    const data = localStorage.getItem(KEYS.KEGIATAN_PRESETS);
    if (!data) return KEGIATAN_LAINNYA_PRESETS;
    try {
      const parsed = JSON.parse(data);
      return KEGIATAN_LAINNYA_PRESETS.map((def) => {
        const found = parsed.find((k: any) => k.name === def.name);
        return found ? { ...def, defaultTime: found.defaultTime || def.defaultTime } : def;
      });
    } catch {
      return KEGIATAN_LAINNYA_PRESETS;
    }
  },

  saveKegiatanLainnyaPresets(presets: { name: KegiatanLainnyaPreset; label: string; defaultTime: string }[]): void {
    localStorage.setItem(KEYS.KEGIATAN_PRESETS, JSON.stringify(presets));
    window.dispatchEvent(new Event('yasfi_schedules_updated'));
  },

  getAttendance(): AttendanceRecord[] {
    const data = localStorage.getItem(KEYS.ATTENDANCE);
    if (!data) {
      const initial = getInitialAttendanceRecords();
      localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(data);
    } catch {
      const initial = getInitialAttendanceRecords();
      return initial;
    }
  },

  saveAttendance(records: AttendanceRecord[]): void {
    localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(records));
  },

  addAttendance(record: Omit<AttendanceRecord, 'id' | 'createdAt'>): AttendanceRecord {
    const records = this.getAttendance();
    const newRecord: AttendanceRecord = {
      ...record,
      id: `rec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    records.unshift(newRecord);
    this.saveAttendance(records);
    return newRecord;
  },

  deleteAttendance(id: string): void {
    const records = this.getAttendance().filter((r) => r.id !== id);
    this.saveAttendance(records);
  },

  resetToDefault(): void {
    localStorage.removeItem(KEYS.TEACHERS);
    localStorage.removeItem(KEYS.SCHEDULES);
    localStorage.removeItem(KEYS.ATTENDANCE);
  }
};
