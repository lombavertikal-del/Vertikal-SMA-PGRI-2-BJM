import { ChangeEvent } from 'react';
import { ArrowRight, Camera } from 'lucide-react';
import { DIMENSIONS } from '../data/surveyData';

export const SCHOOL_LOGO_PATH =
  '/assets/aistudio/WhatsApp_Image_2026-11-19_at_14.13.19_21519199.png';
export const SCHOOL_COVER_PATH =
  '/assets/aistudio/WhatsApp_Image_2026-11-19_at_14.48.39_cc775ec9.jpeg';
export const GALLERY_CLEAN_PATH =
  '/assets/aistudio/IMG_3616_f4580d71.JPG';
export const GALLERY_IBADAH_PATH =
  '/assets/aistudio/WhatsApp_Image_2026-11-19_at_16.26.54_64bdb218.jpeg';
export const GALLERY_SENAM_PATH =
  '/assets/aistudio/IMG_2766_1a2b508c.jpg';
export const GALLERY_DRUMBAND_PATH =
  '/assets/aistudio/IMG_4062_c727c4b4.jpg';

const COVER_QUICK_LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'ringkasan', label: 'Survei' },
  { id: 'grafik', label: 'Grafik' },
  { id: 'kebiasaan', label: 'Analisis' },
  { id: 'siswa', label: 'Data Siswa' },
  { id: 'kesimpulan', label: 'Kesimpulan' },
  { id: 'feedback', label: 'Feedback' },
];

interface CoverScreenProps {
  coverPhoto: string;
  onChangeCoverPhoto: (dataUrl: string) => void;
  onEnterDashboard: (targetId?: string) => void;
}

export function CoverScreen({
  coverPhoto,
  onChangeCoverPhoto,
  onEnterDashboard,
}: CoverScreenProps) {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChangeCoverPhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#1B3A4B]/95 p-3 sm:items-center sm:p-5 backdrop-blur-md">
      <div className="my-auto w-full max-w-5xl overflow-hidden rounded-3xl border-2 border-[#D1B18B] bg-[#FFFDF8] text-[#1B3A4B] shadow-2xl dark:bg-[#142A3A] dark:text-[#F7EFE7]">
        {/* Top institutional ribbon — full width, never cropped */}
        <div className="bg-[#1B3A4B] px-4 py-3 text-center text-xs font-bold tracking-[0.14em] text-[#F7EFE7] sm:text-sm">
          VERTIKAL <span className="text-[#D1B18B]">·</span> SMA PGRI 2 BANJARMASIN
        </div>

        {/* Cover photo: Siswa Hormat XI-2 & XI-3 SMA PGRI 2 Banjarmasin */}
        <div className="relative aspect-[4/3] max-h-[420px] w-full bg-[#2E5A74] sm:aspect-[16/9]">
          <img
            src={coverPhoto}
            alt="Siswa kelas XI-2 dan XI-3 SMA PGRI 2 Banjarmasin hormat bendera saat upacara"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover object-[center_30%]"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-[#1B3A4B]/75 via-transparent to-transparent"
            aria-hidden="true"
          />
          <label className="absolute bottom-3 right-3 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#FFFDF8]/92 px-3.5 py-2 text-xs font-semibold text-[#1B3A4B] shadow-md backdrop-blur-sm transition-colors hover:bg-white">
            <Camera className="h-3.5 w-3.5" aria-hidden="true" />
            Ganti Foto Cover
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>

        {/* Official transparent PNG school emblem + uncropped full title */}
        <div className="px-5 pb-6 pt-0 text-center sm:px-8">
          <div className="-mt-12 relative z-10 mx-auto h-24 w-24 overflow-hidden rounded-full border-4 border-[#D1B18B] bg-white p-1.5 shadow-lg">
            <img
              src={SCHOOL_LOGO_PATH}
              alt="Logo Resmi SMA PGRI 2 Banjarmasin"
              referrerPolicy="no-referrer"
              className="h-full w-full object-contain"
            />
          </div>

          <h1
            style={{ fontFamily: 'var(--font-display)' }}
            className="mx-auto mt-4 max-w-3xl text-xl font-bold leading-snug text-[#1B3A4B] dark:text-[#F7EFE7] sm:text-3xl"
          >
            <span className="block">Selamat Datang di Dashboard</span>
            <span className="block">7 Kebiasaan Anak Indonesia Hebat</span>
            <span className="mt-1 block text-[#8B5E3C] dark:text-[#D1B18B]">
              SMA PGRI 2 Banjarmasin
            </span>
          </h1>
          <p className="mt-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 sm:text-sm">
            Dashboard Survei Kebiasaan Siswa · 765 Pengisian · 308 Siswa Unik
          </p>

          {/* Quick Jump Menu */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 border-y border-[#D1B18B]/50 py-3">
            {COVER_QUICK_LINKS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onEnterDashboard(item.id)}
                className="rounded-lg bg-[#F7EFE7] px-3 py-1.5 text-xs font-semibold text-[#1B3A4B] transition-colors hover:bg-[#1B3A4B] hover:text-white dark:bg-[#0F1E2A] dark:text-[#F7EFE7] dark:hover:bg-[#D1B18B] dark:hover:text-[#1B3A4B] cursor-pointer whitespace-nowrap"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* 7 Kebiasaan Strip (Lengkap, tidak dipotong) */}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {DIMENSIONS.map((habit, idx) => (
              <div
                key={habit}
                className="rounded-xl border border-[#E8DDD0] bg-[#F7EFE7]/80 px-2.5 py-2.5 text-center dark:border-[#2E5A74]/60 dark:bg-[#0F1E2A]/80"
              >
                <p className="font-mono text-[11px] font-bold text-[#8B5E3C] dark:text-[#D1B18B]">
                  0{idx + 1}
                </p>
                <p className="mt-0.5 text-xs font-bold leading-snug text-[#1B3A4B] dark:text-[#F7EFE7]">
                  {habit}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onEnterDashboard()}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1B3A4B] px-7 py-3 text-sm font-bold text-white transition-colors hover:bg-[#2E5A74] dark:bg-[#D1B18B] dark:text-[#1B3A4B] dark:hover:bg-[#E3C8A8] cursor-pointer whitespace-nowrap"
            >
              Masuk Dashboard
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
