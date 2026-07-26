import React, { useState, useEffect } from 'react';
import { Teacher, ActivitySchedule, AttendanceRecord } from './types';
import { StorageService } from './utils/storage';
import { Header } from './components/Header';
import { DailySummary } from './components/DailySummary';
import { AttendanceInput } from './components/AttendanceInput';
import { LateNotificationPanel } from './components/LateNotificationPanel';
import { ExportReport } from './components/ExportReport';
import { TeacherManagement } from './components/TeacherManagement';
import { Logo } from './components/Logo';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('rekap');
  const [initialInputCategory, setInitialInputCategory] = useState<string | undefined>(undefined);

  // App State
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [schedules, setSchedules] = useState<ActivitySchedule[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  // Load state on mount
  useEffect(() => {
    setTeachers(StorageService.getTeachers());
    setSchedules(StorageService.getSchedules());
    setAttendanceRecords(StorageService.getAttendance());
  }, []);

  // Today's late count for notification badge
  const todayStr = new Date().toISOString().split('T')[0];
  const lateCountToday = attendanceRecords.filter(
    (r) => r.date === todayStr && r.status === 'Terlambat'
  ).length;

  // Handlers
  const handleAddRecord = (
    newRec: Omit<AttendanceRecord, 'id' | 'createdAt'>
  ) => {
    const created = StorageService.addAttendance(newRec);
    setAttendanceRecords((prev) => [created, ...prev]);
  };

  const handleDeleteRecord = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus catatan presensi ini?')) {
      StorageService.deleteAttendance(id);
      setAttendanceRecords((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleAddTeacher = (teacherData: Omit<Teacher, 'id'>) => {
    const newTeacher: Teacher = {
      ...teacherData,
      id: `tch-${Date.now()}`,
    };
    const updated = [...teachers, newTeacher];
    setTeachers(updated);
    StorageService.saveTeachers(updated);
  };

  const handleUpdateTeacher = (updatedTeacher: Teacher) => {
    const updated = teachers.map((t) => (t.id === updatedTeacher.id ? updatedTeacher : t));
    setTeachers(updated);
    StorageService.saveTeachers(updated);
  };

  const handleDeleteTeacher = (id: string) => {
    const updated = teachers.filter((t) => t.id !== id);
    setTeachers(updated);
    StorageService.saveTeachers(updated);
  };

  const handleUpdateSchedules = (updatedSchedules: ActivitySchedule[]) => {
    setSchedules(updatedSchedules);
    StorageService.saveSchedules(updatedSchedules);
  };

  const handleNavigateToInput = (category?: string) => {
    setInitialInputCategory(category);
    setActiveTab('input');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-900">
      {/* Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lateCountToday={lateCountToday}
      />

      {/* Main App Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8">
        {activeTab === 'rekap' && (
          <DailySummary
            records={attendanceRecords}
            teachers={teachers}
            schedules={schedules}
            onNavigateToInput={handleNavigateToInput}
            onNavigateToNotif={() => setActiveTab('notifikasi')}
            onDeleteRecord={handleDeleteRecord}
          />
        )}

        {activeTab === 'input' && (
          <AttendanceInput
            teachers={teachers}
            schedules={schedules}
            initialCategory={initialInputCategory}
            onSubmitRecord={handleAddRecord}
            onDone={() => setActiveTab('rekap')}
          />
        )}

        {activeTab === 'notifikasi' && (
          <LateNotificationPanel
            records={attendanceRecords}
            teachers={teachers}
            schedules={schedules}
          />
        )}

        {activeTab === 'laporan' && (
          <ExportReport
            records={attendanceRecords}
            teachers={teachers}
            schedules={schedules}
          />
        )}

        {activeTab === 'master' && (
          <TeacherManagement
            teachers={teachers}
            schedules={schedules}
            onAddTeacher={handleAddTeacher}
            onUpdateTeacher={handleUpdateTeacher}
            onDeleteTeacher={handleDeleteTeacher}
            onUpdateSchedules={handleUpdateSchedules}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-emerald-950 text-emerald-200 border-t border-emerald-900/80 py-8 px-4 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Logo variant="icon" size="md" />
            <div>
              <h3 className="font-extrabold text-amber-400 text-sm tracking-wide">
                PONDOK PESANTREN TAHFIDZ YASFI SHIGOR
              </h3>
              <p className="text-xs text-emerald-300/80">
                Sukamaju - Tambelang - Bekasi - Jawa Barat
              </p>
              <p className="text-[11px] text-emerald-400 mt-0.5">
                Sistem Presensi Kedisiplinan Guru & Musyrif Tahfidz
              </p>
            </div>
          </div>

          <div className="text-center md:text-right text-xs text-emerald-300/90 space-y-1">
            <p className="font-semibold text-emerald-100">
              Tasmi' • Bimbingan • Sholat Berjama'ah • Sholat Duha • Agenda Kegiatan
            </p>
            <p className="text-[11px] text-emerald-400/80">
              © {new Date().getFullYear()} Ponpes Tahfidz Yasfi Shigor. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
