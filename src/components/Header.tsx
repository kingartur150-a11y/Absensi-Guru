import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { 
  LayoutDashboard, 
  QrCode, 
  BellRing, 
  FileSpreadsheet, 
  Users, 
  Clock, 
  Calendar,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lateCountToday: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  lateCountToday,
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' WIB'
      );
      setDateStr(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    {
      id: 'rekap',
      label: 'Rekap Harian',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'input',
      label: 'Input Absensi',
      icon: QrCode,
      badge: 'Manual / QR',
    },
    {
      id: 'notifikasi',
      label: 'Notifikasi Keterlambatan',
      icon: BellRing,
      badge: lateCountToday > 0 ? `${lateCountToday}` : null,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'laporan',
      label: 'Laporan & Ekspor',
      icon: FileSpreadsheet,
      badge: 'Excel / PDF',
    },
    {
      id: 'master',
      label: 'Data Guru & Jadwal',
      icon: Users,
      badge: null,
    },
  ];

  return (
    <header className="bg-white border-b border-slate-200 shadow-xs sticky top-0 z-40">
      {/* Top Emerald Green Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white px-4 py-2 text-xs md:text-sm border-b border-emerald-950">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium tracking-wide">
            <span className="bg-amber-400 text-emerald-950 text-[10px] uppercase px-2 py-0.5 rounded font-bold tracking-widest shadow-xs">
              SISTEM RESMI
            </span>
            <span className="truncate font-medium text-emerald-50">Pondok Pesantren Tahfidz Yasfi Bekasi - Tambelang, Bekasi</span>
          </div>

          <div className="flex items-center gap-4 text-emerald-100 text-[11px] md:text-xs">
            <div className="flex items-center gap-1.5 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-700/60">
              <Calendar className="w-3.5 h-3.5 text-amber-300" />
              <span>{dateStr}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-700/60 font-mono font-semibold text-amber-300">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>{timeStr}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header Brand Row */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Logo variant="compact" size="md" />
        </div>

        <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200/80 rounded-xl px-4 py-2">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <div className="text-xs">
            <p className="font-bold text-emerald-950">Panel Absensi & Kedisiplinan Guru</p>
            <p className="text-emerald-700 font-medium">Tasmi' • Bimbingan • Sholat • Duha • Kegiatan</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-slate-50 border-t border-slate-200 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-emerald-800 hover:bg-emerald-50/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.badgeColor || (isActive ? 'bg-amber-400 text-emerald-950' : 'bg-slate-200 text-slate-700')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
