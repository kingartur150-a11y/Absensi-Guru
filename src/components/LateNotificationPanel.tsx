import React, { useState } from 'react';
import { AttendanceRecord, Teacher, ActivitySchedule } from '../types';
import { 
  BellRing, 
  MessageSquare, 
  Copy, 
  Check, 
  ExternalLink, 
  Clock, 
  AlertTriangle, 
  Send, 
  Calendar, 
  UserCheck, 
  CheckCircle2,
  RefreshCw,
  Phone
} from 'lucide-react';

interface LateNotificationPanelProps {
  records: AttendanceRecord[];
  teachers: Teacher[];
  schedules: ActivitySchedule[];
}

export const LateNotificationPanel: React.FC<LateNotificationPanelProps> = ({
  records,
  teachers,
  schedules,
}) => {
  const [filterDate, setFilterDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sentMap, setSentMap] = useState<Record<string, boolean>>({});

  // Get late records for selected date
  const lateRecords = records.filter(
    (r) => r.status === 'Terlambat' && r.date === filterDate
  );

  const getTeacherPhone = (teacherId: string, teacherNip: string): string => {
    const tch = teachers.find(
      (t) => t.id === teacherId || t.nip === teacherNip
    );
    return tch?.phone || '6281234567890';
  };

  const generateWaMessage = (rec: AttendanceRecord): string => {
    const tch = teachers.find((t) => t.id === rec.teacherId || t.nip === rec.teacherNip);
    const activityName =
      rec.activityCategory === 'Kegiatan Lainnya' && rec.customActivityName
        ? `${rec.activityCategory} (${rec.customActivityName})`
        : rec.activityCategory;

    const sch = schedules.find((s) => s.id === rec.activityCategory);
    const targetTime = sch ? sch.defaultTime : 'Jadwal Pesantren';

    return `Assalamu'alaikum Warahmatullahi Wabarakatuh.

*PEMBERITAHUAN KETERLAMBATAN ABSENSI*
*Pondok Pesantren Tahfidz Yasfi Shigor - Bekasi*

Yth. *${rec.teacherName}* (${rec.teacherNip})
${tch?.role ? `Jabatan: ${tch.role}` : ''}

Menginfokan catatan kedisiplinan presensi harian guru:
• *Kegiatan:* ${activityName}
• *Tanggal:* ${rec.date}
• *Target Jam:* ${targetTime} WIB
• *Waktu Absen:* ${rec.time} WIB
• *Status:* TERLAMBAT (${rec.lateMinutes} Menit)
${rec.notes ? `• *Catatan:* ${rec.notes}` : ''}

Mohon kedisiplinan serta ketepatan waktu untuk agenda selanjutnya demi kelancaran pembinaan santri pondok. Terima kasih atas perhatian dan kerjasamanya.

Wassalamu'alaikum Warahmatullahi Wabarakatuh.
_Sekretariat & Sie Kedisiplinan Ponpes Tahfidz Yasfi Shigor_`;
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendWa = (rec: AttendanceRecord) => {
    const phone = getTeacherPhone(rec.teacherId, rec.teacherNip);
    const message = generateWaMessage(rec);
    const encoded = encodeURIComponent(message);
    const waUrl = `https://wa.me/${phone}?text=${encoded}`;
    
    // Mark as sent
    setSentMap((prev) => ({ ...prev, [rec.id]: true }));
    window.open(waUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#1B3022] p-5 md:p-6 rounded-2xl text-[#E9E0D2] border border-[#2D4536] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#D4AF37] text-[#1B3022] font-bold text-[10px] uppercase px-3 py-0.5 rounded-full mb-2">
            <BellRing className="w-3.5 h-3.5" /> OTOMATISASI NOTIFIKASI
          </div>
          <h2 className="text-xl font-serif font-bold tracking-tight text-white">Notifikasi Keterlambatan Guru</h2>
          <p className="text-xs text-[#8A9A8A] mt-0.5">
            Kirimkan pemberitahuan otomatis ke WhatsApp ustadz/ustazah yang melewati batas toleransi waktu
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#2D4536] p-2 rounded-xl border border-[#3E5C49]">
          <Calendar className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-xs font-bold text-[#E9E0D2]">Tanggal:</span>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="bg-white text-[#2D3E40] text-xs font-bold rounded-lg px-2.5 py-1 outline-none"
          />
        </div>
      </div>

      {/* Summary Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#EAE2D6] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#A63D40]/10 text-[#A63D40] flex items-center justify-center shrink-0 border border-[#A63D40]/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-serif font-bold text-[#A63D40]">{lateRecords.length}</span>
            <p className="text-xs text-[#2D3E40] font-bold">Total Terlambat Hari Ini</p>
            <p className="text-[10px] text-[#8A9A8A]">Perlu pengiriman notifikasi</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#EAE2D6] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#2D4536]/10 text-[#2D4536] flex items-center justify-center shrink-0 border border-[#2D4536]/20">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-serif font-bold text-[#2D4536]">
              {Object.keys(sentMap).length} / {lateRecords.length}
            </span>
            <p className="text-xs text-[#2D3E40] font-bold">Notifikasi Terkirim</p>
            <p className="text-[10px] text-[#8A9A8A]">Melalui WhatsApp Web/App</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#EAE2D6] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/20 text-[#1B3022] flex items-center justify-center shrink-0 border border-[#D4AF37]">
            <Clock className="w-6 h-6 text-[#C19A2E]" />
          </div>
          <div>
            <span className="text-2xl font-serif font-bold text-[#1B3022]">
              {lateRecords.reduce((acc, curr) => acc + curr.lateMinutes, 0)} Mnt
            </span>
            <p className="text-xs text-[#2D3E40] font-bold">Total Durasi Keterlambatan</p>
            <p className="text-[10px] text-[#8A9A8A]">Akumulasi menit seluruh guru</p>
          </div>
        </div>
      </div>

      {/* List of Late Records */}
      <div className="bg-white rounded-2xl border border-[#EAE2D6] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#EAE2D6] bg-[#FDFBF9] flex items-center justify-between">
          <h3 className="font-serif font-bold text-sm text-[#1B3022]">
            Daftar Guru Terlambat Tanggal {filterDate} ({lateRecords.length})
          </h3>
          <span className="text-xs text-[#8A9A8A] font-medium">
            Format pesan siap kirim otomatis
          </span>
        </div>

        {lateRecords.length === 0 ? (
          <div className="p-12 text-center text-[#8A9A8A] space-y-2">
            <CheckCircle2 className="w-12 h-12 mx-auto text-[#2D4536]" />
            <h4 className="font-serif font-bold text-[#1B3022] text-base">Alhamdulillah! Tidak Ada Keterlambatan</h4>
            <p className="text-xs text-[#8A9A8A]">
              Seluruh ustadz & musyrif hadir tepat waktu pada tanggal {filterDate}.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#F2EFE9]">
            {lateRecords.map((rec) => {
              const msg = generateWaMessage(rec);
              const isSent = sentMap[rec.id];

              return (
                <div key={rec.id} className="p-4 md:p-5 hover:bg-[#FDFBF9] transition space-y-3">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#A63D40]/10 text-[#A63D40] font-bold flex items-center justify-center shrink-0 border border-[#A63D40]/20">
                        <Clock className="w-5 h-5" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-[#1B3022] text-sm">{rec.teacherName}</h4>
                          <span className="text-[10px] font-mono bg-[#F8F5F0] px-2 py-0.5 rounded text-[#4A5D4A] border border-[#EAE2D6]">
                            {rec.teacherNip}
                          </span>
                        </div>

                        <div className="text-xs text-[#4A5D4A] mt-0.5 flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-[#1B3022]">
                            {rec.activityCategory}
                            {rec.customActivityName ? ` (${rec.customActivityName})` : ''}
                          </span>
                          <span>•</span>
                          <span className="font-bold text-[#A63D40]">
                            Terlambat {rec.lateMinutes} Menit ({rec.time} WIB)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge & Actions */}
                    <div className="flex items-center gap-2 self-end md:self-auto">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          isSent
                            ? 'bg-[#2D4536]/10 text-[#2D4536] border border-[#2D4536]/30'
                            : 'bg-[#A63D40]/10 text-[#A63D40] border border-[#A63D40]/30'
                        }`}
                      >
                        {isSent ? '✓ WA Terkirim' : 'Belum Dikirim'}
                      </span>

                      <button
                        onClick={() => handleCopy(rec.id, msg)}
                        className="px-3 py-1.5 bg-[#F8F5F0] hover:bg-[#F2EFE9] text-[#2D3E40] text-xs font-bold rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer border border-[#EAE2D6]"
                      >
                        {copiedId === rec.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#2D4536]" />
                            <span>Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-[#8A9A8A]" />
                            <span>Salin Pesan</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleSendWa(rec)}
                        className="px-4 py-1.5 bg-[#1B3022] hover:bg-[#2D4536] text-white text-xs font-bold rounded-lg shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Kirim WA</span>
                        <ExternalLink className="w-3 h-3 text-[#D4AF37]/80" />
                      </button>
                    </div>
                  </div>

                  {/* Message Preview Box */}
                  <div className="bg-[#1B3022] text-[#E9E0D2] p-3.5 rounded-xl font-mono text-[11px] whitespace-pre-line border border-[#2D4536] leading-relaxed max-h-36 overflow-y-auto">
                    {msg}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
