import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Image as ImageIcon,
  MapPin,
  Menu,
  Moon,
  Sun,
  X,
} from 'lucide-react';
import { DimensionKey, SCALE_LABELS, STUDENTS, StudentRecord } from './data/surveyData';
import { computeDashboardMetrics, exportStudentsToCSV } from './utils/analytics';
import {
  CoverScreen,
  GALLERY_CLEAN_PATH,
  GALLERY_DRUMBAND_PATH,
  GALLERY_IBADAH_PATH,
  GALLERY_SENAM_PATH,
  SCHOOL_COVER_PATH,
  SCHOOL_LOGO_PATH,
} from './components/CoverScreen';
import { InteractiveCharts } from './components/InteractiveCharts';
import { HabitAnalysisSection } from './components/HabitAnalysisSection';
import {
  FeedbackEntry,
  StudentDirectorySection,
} from './components/StudentDirectorySection';
import { SavedFeedbackSection } from './components/SavedFeedbackSection';
import { InsightsConclusionSection } from './components/InsightsConclusionSection';

const NAV_LINKS = [
  { href: '#ringkasan', label: 'Survei' },
  { href: '#grafik', label: 'Grafik' },
  { href: '#kebiasaan', label: 'Analisis' },
  { href: '#siswa', label: 'Data Siswa' },
  { href: '#kesimpulan', label: 'Kesimpulan' },
];

const HABIT_DESCRIPTIONS: Record<DimensionKey, string> = {
  'Bangun Pagi': 'Bangun sebelum pukul 06.00, datang tepat waktu, merapikan tempat tidur.',
  Beribadah: 'Menyempatkan berdoa, mengajak teman beribadah, tidak menunda karena HP.',
  Berolahraga: 'Olahraga rutin di luar jam PJOK, jalan kaki jarak dekat, dan pemanasan.',
  'Makan Sehat dan Bergizi':
    'Memilih air putih, mengurangi jajanan kurang sehat, menghabiskan MBG tanpa sisa.',
  'Gemar Belajar':
    'Rasa ingin tahu tinggi, mengajukan pertanyaan berbobot, mencari jawaban mandiri.',
  Bermasyarakat:
    'Menyapa dan bersikap ramah, aktif organisasi/ekskul, menghargai perbedaan.',
  'Tidur Cepat':
    'Tidur cukup 7–8 jam, menjauhkan HP saat tidur, dan terhindar dari begadang.',
};

const THEME_STORAGE_KEY = 'vertikal_smagrida_theme_v1';
const FEEDBACK_STORAGE_KEY = 'vertikal_smagrida_feedbacks_v1';

export default function App() {
  const metrics = useMemo(() => computeDashboardMetrics(), []);
  const [showCover, setShowCover] = useState(true);
  const [coverPhoto, setCoverPhoto] = useState<string>(SCHOOL_COVER_PATH);
  const [selectedDimension, setSelectedDimension] = useState<DimensionKey | 'ALL'>('ALL');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) === 'dark';
    } catch {
      return false;
    }
  });

  const [feedbacks, setFeedbacks] = useState<FeedbackEntry[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(FEEDBACK_STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  });

  const filteredStudentsRef = useRef<StudentRecord[]>(STUDENTS);

  const slides = useMemo(
    () => [
      {
        src: GALLERY_CLEAN_PATH,
        alt: 'Siswa bersih-bersih lingkungan depan kelas XII IPS 2 SMA PGRI 2 Banjarmasin',
        caption: 'Gotong Royong & Kebersihan Lingkungan · Depan Kelas XII IPS 2',
      },
      {
        src: GALLERY_IBADAH_PATH,
        alt: 'Siswa SMA PGRI 2 Banjarmasin mengaji bersama dalam pembiasaan Beribadah',
        caption: 'Pembiasaan Beribadah · Tadarus & Mengaji Bersama',
      },
      {
        src: GALLERY_SENAM_PATH,
        alt: 'Siswa SMA PGRI 2 Banjarmasin mengikuti senam pagi bersama di lapangan',
        caption: 'Pembiasaan Berolahraga · Senam Pagi Bersama di Lapangan Sekolah',
      },
      {
        src: GALLERY_DRUMBAND_PATH,
        alt: 'Ekstrakurikuler drumband SMA PGRI 2 Banjarmasin dalam pembiasaan Bermasyarakat',
        caption: 'Pembiasaan Bermasyarakat · Ekstrakurikuler Drumband SMAGRIDA',
      },
    ],
    []
  );

  // Auto-advance school ceremony photo slider
  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
    } catch {
      // Ignore storage errors
    }
  }, [isDark]);

  useEffect(() => {
    try {
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(feedbacks));
    } catch {
      // Ignore storage errors
    }
  }, [feedbacks]);

  const handleFilteredChange = useCallback((filtered: StudentRecord[]) => {
    filteredStudentsRef.current = filtered;
  }, []);

  const handleExportCSV = () => {
    exportStudentsToCSV(filteredStudentsRef.current);
  };

  const handleEnterDashboard = (targetId?: string) => {
    setShowCover(false);
    if (targetId) {
      requestAnimationFrame(() => {
        document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  };

  const handleAddFeedback = useCallback((entry: Omit<FeedbackEntry, 'id' | 'tgl'>) => {
    const newItem: FeedbackEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      tgl: new Date().toLocaleString('id-ID'),
    };
    setFeedbacks((prev) => [newItem, ...prev]);
  }, []);

  const handleDeleteFeedback = useCallback((id: string) => {
    setFeedbacks((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const handleClearAllFeedbacks = useCallback(() => {
    setFeedbacks([]);
  }, []);

  const categoryBreakdown = [
    {
      label: 'Sangat Baik',
      count: metrics.categoryCounts['Sangat Baik'],
      barClass: 'bg-[#1B3A4B] dark:bg-[#D1B18B]',
      textClass: 'text-[#1B3A4B] dark:text-[#D1B18B]',
    },
    {
      label: 'Baik',
      count: metrics.categoryCounts['Baik'],
      barClass: 'bg-[#2E5A74] dark:bg-[#729BA3]',
      textClass: 'text-[#2E5A74] dark:text-[#729BA3]',
    },
    {
      label: 'Cukup',
      count: metrics.categoryCounts['Cukup'],
      barClass: 'bg-[#729BA3] dark:bg-sky-400',
      textClass: 'text-[#557A82] dark:text-sky-300',
    },
    {
      label: 'Perlu Dibina',
      count: metrics.categoryCounts['Perlu Dibina'],
      barClass: 'bg-[#8B5E3C] dark:bg-rose-400',
      textClass: 'text-rose-700 dark:text-rose-400',
    },
  ];

  const habitTopBorders = [
    'border-t-amber-500',
    'border-t-emerald-500',
    'border-t-cyan-500',
    'border-t-rose-500',
    'border-t-violet-500',
    'border-t-[#2E5A74]',
    'border-t-[#1B3A4B] dark:border-t-[#D1B18B]',
  ];

  return (
    <div className="relative min-h-screen overflow-x-clip">
      {/* Welcome Cover Screen */}
      {showCover && (
        <CoverScreen
          coverPhoto={coverPhoto}
          onChangeCoverPhoto={setCoverPhoto}
          onEnterDashboard={handleEnterDashboard}
        />
      )}

      {/* Animated Vintage Denim Gradient Canvas */}
      <div className="bg-vertikal-animated fixed inset-0 -z-20" aria-hidden="true" />
      <div
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div className="bg-orb-slow absolute -left-24 -top-24 h-96 w-96 rounded-full bg-[#D1B18B]/20 blur-3xl" />
        <div className="bg-orb-slower absolute -right-24 top-1/3 h-[28rem] w-[28rem] rounded-full bg-[#729BA3]/25 blur-3xl" />
        <div className="bg-orb-slow absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-[#1B3A4B]/25 blur-3xl" />
      </div>

      {/* Main Content Container */}
      <div className="mx-auto max-w-[1220px] px-4 py-4 sm:px-6 sm:py-6">
        {/* Top Bar (Clean 3-Zone Contract) */}
        <header className="glass-header sticky top-3 z-30 rounded-2xl px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-8">
            <a
              href="#home"
              className="inline-flex items-center gap-2.5 text-base font-extrabold tracking-tight text-[#1B3A4B] dark:text-[#F7EFE7] sm:text-lg whitespace-nowrap shrink-0"
            >
              <img
                src={SCHOOL_LOGO_PATH}
                alt="Logo SMA PGRI 2 Banjarmasin"
                referrerPolicy="no-referrer"
                className="h-9 w-9 rounded-full border-2 border-[#D1B18B] bg-white object-contain p-0.5"
              />
              <span style={{ fontFamily: 'var(--font-display)' }}>
                VERTIKAL SMA PGRI 2 BANJARMASIN
              </span>
            </a>

            <nav
              aria-label="Navigasi utama"
              className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600 dark:text-slate-300"
            >
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="transition-colors hover:text-[#1B3A4B] hover:underline underline-offset-4 dark:hover:text-[#D1B18B] whitespace-nowrap shrink-0"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1B3A4B] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#2E5A74] dark:bg-[#D1B18B] dark:text-[#1B3A4B] dark:hover:bg-[#E2C6A3] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                Ekspor CSV
              </button>
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
                aria-expanded={mobileMenuOpen}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#D1B18B]/70 bg-white/80 text-[#1B3A4B] dark:border-[#729BA3]/40 dark:bg-[#142A3A] dark:text-[#F7EFE7] md:hidden cursor-pointer"
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Mobile Drawer Menu */}
          {mobileMenuOpen && (
            <nav
              aria-label="Navigasi seluler"
              className="mt-3 flex flex-col gap-1 border-t border-[#1B3A4B]/10 pt-3 dark:border-[#729BA3]/25 md:hidden"
            >
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-[#1B3A4B] hover:bg-[#F7EFE7] dark:text-[#F7EFE7] dark:hover:bg-[#1B3A4B]"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#feedback"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-[#1B3A4B] hover:bg-[#F7EFE7] dark:text-[#F7EFE7] dark:hover:bg-[#1B3A4B]"
              >
                Feedback
              </a>
            </nav>
          )}
        </header>

        <main id="home" className="mt-5 space-y-6 scroll-mt-24">
          {/* Interactive Auto-Sliding 4-Photo School Activity Gallery (16:9 Precision) */}
          <div className="relative overflow-hidden rounded-3xl border-2 border-[#D1B18B] bg-[#1B3A4B] shadow-lg">
            <div className="relative aspect-[4/3] max-h-[380px] w-full overflow-hidden sm:aspect-[16/9]">
              {slides.map((slide, idx) => (
                <img
                  key={slide.caption}
                  src={slide.src}
                  alt={slide.alt}
                  referrerPolicy="no-referrer"
                  className={`absolute inset-0 h-full w-full object-cover object-[center_35%] transition-opacity duration-700 ${
                    idx === activeSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                />
              ))}
            </div>

            {/* Scrim for high legibility */}
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0F1E2A]/88 via-[#1B3A4B]/20 to-transparent"
              aria-hidden="true"
            />

            {/* Slide Navigation Arrows */}
            <button
              type="button"
              onClick={() =>
                setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length)
              }
              aria-label="Foto sebelumnya"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-[#0F1E2A]/65 p-2 text-white backdrop-blur-sm transition-colors hover:bg-[#1B3A4B] cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setActiveSlide((prev) => (prev + 1) % slides.length)}
              aria-label="Foto berikutnya"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-[#0F1E2A]/65 p-2 text-white backdrop-blur-sm transition-colors hover:bg-[#1B3A4B] cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Banner Content + Workspace Utility Controls */}
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-6">
              <div>
                <p className="text-xs font-semibold text-[#D1B18B]">
                  {slides[activeSlide].caption}
                </p>
                <p
                  style={{ fontFamily: 'var(--font-display)' }}
                  className="mt-0.5 text-lg font-bold text-white sm:text-2xl"
                >
                  7 Kebiasaan Anak Indonesia Hebat
                </p>
                {/* Slide indicators */}
                <div className="mt-2 flex items-center gap-1.5">
                  {slides.map((s, idx) => (
                    <button
                      key={s.caption}
                      type="button"
                      onClick={() => setActiveSlide(idx)}
                      aria-label={`Tampilkan foto ${idx + 1}`}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        idx === activeSlide
                          ? 'w-7 bg-[#D1B18B]'
                          : 'w-2 bg-white/50 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDark((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#D1B18B]/70 bg-[#FFFDF8]/92 px-3.5 py-2 text-xs font-bold text-[#1B3A4B] shadow-sm backdrop-blur-md transition-colors hover:bg-white dark:bg-[#0F1E2A]/90 dark:text-[#F7EFE7] dark:hover:bg-[#1B3A4B] cursor-pointer whitespace-nowrap"
                >
                  {isDark ? (
                    <>
                      <Sun className="h-3.5 w-3.5 text-[#D1B18B]" aria-hidden="true" />
                      Mode Terang
                    </>
                  ) : (
                    <>
                      <Moon className="h-3.5 w-3.5 text-[#1B3A4B]" aria-hidden="true" />
                      Mode Gelap
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCover(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/30 bg-[#1B3A4B]/85 px-3.5 py-2 text-xs font-semibold text-[#F7EFE7] backdrop-blur-md transition-colors hover:bg-[#2E5A74] cursor-pointer whitespace-nowrap"
                >
                  <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  Tampilkan Cover
                </button>
              </div>
            </div>
          </div>

          {/* 7 Kebiasaan Anak Indonesia Hebat — Lengkap */}
          <section className="glass-surface rounded-3xl p-6 sm:p-8">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold text-[#8B5E3C] dark:text-[#D1B18B]">
                  Susunan Resmi · Lengkap Tanpa Dipotong
                </p>
                <h2
                  style={{ fontFamily: 'var(--font-display)' }}
                  className="mt-1 text-xl font-bold tracking-tight text-[#1B3A4B] dark:text-[#F7EFE7] sm:text-2xl"
                >
                  7 Kebiasaan Anak Indonesia Hebat
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Klik salah satu kebiasaan untuk memfilter grafik &amp; tabel indikator
              </p>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
              {metrics.dimensionSummaries.map((dim, idx) => {
                const isActive = selectedDimension === dim.dimension;
                return (
                  <button
                    key={dim.dimension}
                    type="button"
                    onClick={() =>
                      setSelectedDimension(isActive ? 'ALL' : dim.dimension)
                    }
                    className={`flex flex-col justify-between rounded-2xl border border-t-4 p-3.5 text-left transition-colors cursor-pointer ${
                      habitTopBorders[idx % habitTopBorders.length]
                    } ${
                      isActive
                        ? 'border-[#1B3A4B] bg-[#F7EFE7] dark:border-[#D1B18B] dark:bg-[#1B3A4B]'
                        : 'border-[#E8DDD0] bg-[#FFFDF8] hover:bg-[#F7EFE7]/80 dark:border-[#2E5A74]/50 dark:bg-[#102332] dark:hover:bg-[#1B3A4B]/70'
                    }`}
                  >
                    <div>
                      <div className="flex items-baseline justify-between gap-1">
                        <span className="font-mono text-[11px] font-bold text-[#8B5E3C] dark:text-[#D1B18B]">
                          0{idx + 1}
                        </span>
                        <span className="font-mono text-xs font-bold tabular-nums text-[#2E5A74] dark:text-[#729BA3]">
                          {dim.mean.toFixed(2)}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs font-bold leading-snug text-[#1B3A4B] dark:text-[#F7EFE7]">
                        {dim.dimension}
                      </p>
                    </div>
                    <p className="mt-2 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                      {HABIT_DESCRIPTIONS[dim.dimension]}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section 2: Ringkasan Statistik Survei Siswa */}
          <section id="ringkasan" className="scroll-mt-24">
            <div className="glass-surface rounded-3xl p-6 sm:p-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <p className="text-xs font-semibold text-[#8B5E3C] dark:text-[#D1B18B]">
                    Ringkasan Statistik Survei · 4 Hari Pengisian · 21 Pernyataan
                  </p>
                  <h1
                    style={{ fontFamily: 'var(--font-display)' }}
                    className="mt-1.5 text-2xl font-bold tracking-tight text-[#1B3A4B] dark:text-[#F7EFE7] sm:text-3xl [text-wrap:balance]"
                  >
                    Statistik Survei Kebiasaan Siswa — VERTIKAL SMA PGRI 2 Banjarmasin
                  </h1>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    Pemetaan objektif 765 pengisian survei dari 308 siswa SMA PGRI 2
                    Banjarmasin untuk mendukung pembinaan karakter berbasis data nyata.
                  </p>
                </div>
                <div className="text-left lg:text-right shrink-0">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Skor Keseluruhan Sekolah
                  </p>
                  <p className="mt-0.5 font-mono text-2xl font-bold tabular-nums text-[#1B3A4B] dark:text-[#D1B18B] sm:text-3xl">
                    {metrics.overallMean.toFixed(2)}
                    <span className="ml-1 text-sm font-normal text-slate-500 dark:text-slate-400">
                      / 4.00
                    </span>
                  </p>
                  <p className="text-xs font-semibold text-[#2E5A74] dark:text-[#729BA3]">
                    Kategori {metrics.overallCategory} · Modus Skala {metrics.overallModeScale} (
                    {SCALE_LABELS[metrics.overallModeScale]})
                  </p>
                </div>
              </div>

              {/* 4-Column KPI Strip */}
              <div className="mt-6 grid grid-cols-1 gap-4 border-t border-[#1B3A4B]/10 pt-6 dark:border-[#729BA3]/25 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Total Pengisian Survei
                  </p>
                  <p className="font-mono text-3xl font-bold tabular-nums text-[#1B3A4B] dark:text-[#F7EFE7]">
                    {metrics.totalResponses}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-mono font-semibold tabular-nums">
                      {metrics.totalStudents}
                    </span>{' '}
                    siswa unik · 9 kelas (X–XII)
                  </p>
                </div>

                <div className="space-y-1 sm:border-l sm:border-[#1B3A4B]/10 sm:pl-4 dark:sm:border-[#729BA3]/25">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Skor Rata-rata Siswa
                  </p>
                  <p className="font-mono text-3xl font-bold tabular-nums text-[#2E5A74] dark:text-[#729BA3]">
                    {metrics.overallMean.toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Skala 1–4 · {metrics.validStudentCount} profil lengkap
                  </p>
                </div>

                <div className="space-y-1 lg:border-l lg:border-[#1B3A4B]/10 lg:pl-4 dark:lg:border-[#729BA3]/25">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Kelas Skor Tertinggi
                  </p>
                  <p className="font-mono text-3xl font-bold tabular-nums text-[#1B3A4B] dark:text-[#D1B18B]">
                    {metrics.highestClass.kelas}
                  </p>
                  <p className="font-mono text-xs tabular-nums text-slate-600 dark:text-slate-300">
                    {metrics.highestClass.mean.toFixed(2)} · Terendah{' '}
                    {metrics.lowestClass.kelas} ({metrics.lowestClass.mean.toFixed(2)})
                  </p>
                </div>

                <div className="space-y-1 sm:border-l sm:border-[#1B3A4B]/10 sm:pl-4 dark:sm:border-[#729BA3]/25">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Dimensi Terkuat vs Prioritas
                  </p>
                  <p className="text-lg font-bold leading-8 text-[#1B3A4B] dark:text-[#F7EFE7]">
                    {metrics.strongestDimensions[0].dimension}{' '}
                    <span className="font-mono text-base tabular-nums text-[#2E5A74] dark:text-[#729BA3]">
                      {metrics.strongestDimensions[0].mean.toFixed(2)}
                    </span>
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Perlu dibina:{' '}
                    <span className="font-semibold text-rose-700 dark:text-rose-400">
                      {metrics.weakestDimensions[0].dimension} (
                      {metrics.weakestDimensions[0].mean.toFixed(2)})
                    </span>
                  </p>
                </div>
              </div>

              {/* Distribution Bar of 308 Students */}
              <div className="mt-6 border-t border-[#1B3A4B]/10 pt-5 dark:border-[#729BA3]/25">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-[#1B3A4B] dark:text-[#F7EFE7]">
                    Sebaran Kategori {metrics.totalStudents} Siswa
                  </span>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-600 dark:text-slate-300">
                    {categoryBreakdown.map((c) => (
                      <span key={c.label} className="inline-flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-xs ${c.barClass}`} />
                        <span>{c.label}:</span>
                        <strong className={`font-mono tabular-nums ${c.textClass}`}>
                          {c.count}
                        </strong>
                      </span>
                    ))}
                    {metrics.categoryCounts['Data Kosong'] > 0 && (
                      <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                        Data parsial: {metrics.categoryCounts['Data Kosong']}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-2.5 flex h-2.5 w-full overflow-hidden rounded-full bg-[#E8DDD0] dark:bg-[#0F1E2A]">
                  {categoryBreakdown.map((c) => {
                    const widthPct = (c.count / metrics.totalStudents) * 100;
                    return (
                      <div
                        key={c.label}
                        className={`${c.barClass} transition-all`}
                        style={{ width: `${widthPct}%` }}
                        title={`${c.label}: ${c.count} siswa (${widthPct.toFixed(1)}%)`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Interactive Bar Charts */}
          <InteractiveCharts
            dimensionSummaries={metrics.dimensionSummaries}
            classSummaries={metrics.classSummaries}
            selectedDimension={selectedDimension}
            onSelectDimension={setSelectedDimension}
            isDark={isDark}
          />

          {/* Section 4: Habit Analysis (Mean, Mode, Least Chosen) */}
          <HabitAnalysisSection
            metrics={metrics}
            selectedDimension={selectedDimension}
            onSelectDimension={setSelectedDimension}
          />

          {/* Section 5: Student Directory Search, Profile Avatar & Form 1 (Feedback) */}
          <StudentDirectorySection
            classList={metrics.classList}
            overallMean={metrics.overallMean}
            dimensionSummaries={metrics.dimensionSummaries}
            feedbacks={feedbacks}
            onAddFeedback={handleAddFeedback}
            onDeleteFeedback={handleDeleteFeedback}
            onFilteredChange={handleFilteredChange}
          />

          {/* Section 6: Insights, 4 Action Plans & 6-Point Data Conclusion */}
          <InsightsConclusionSection metrics={metrics} />

          {/* Section 7: Saved Coaching Feedback Archive */}
          <SavedFeedbackSection
            feedbacks={feedbacks}
            onDeleteFeedback={handleDeleteFeedback}
            onClearAllFeedbacks={handleClearAllFeedbacks}
          />
        </main>

        {/* Official Institutional Footer with Full School Address & Maps Link */}
        <footer className="mt-8 rounded-3xl border-2 border-[#D1B18B] bg-gradient-to-br from-[#1B3A4B] to-[#2E5A74] p-6 text-[#F7EFE7] shadow-lg sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#D1B18B]">
                <MapPin className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wider text-[#D1B18B]">
                  ALAMAT RESMI SEKOLAH
                </p>
                <h2
                  style={{ fontFamily: 'var(--font-display)' }}
                  className="mt-0.5 text-lg font-bold text-white sm:text-xl"
                >
                  VERTIKAL SMA PGRI 2 BANJARMASIN
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#F7EFE7]/90">
                  Jl. Cempaka Sari 3 No. 115, Kelurahan Basirih, Kecamatan Banjarmasin Barat,
                  Kota Banjarmasin, Kalimantan Selatan 70114.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                  <a
                    href="https://maps.google.com/?q=Jl.+Cempaka+Sari+3+No.+115+Basirih+Banjarmasin+Barat+Banjarmasin+Kalimantan+Selatan+70114"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-bold text-[#D1B18B] underline underline-offset-4 transition-colors hover:text-white"
                  >
                    Buka di Google Maps
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                  <span aria-hidden="true" className="text-white/30">
                    |
                  </span>
                  <span className="text-[#F7EFE7]/80">
                    © 2026 VERTIKAL SMA PGRI 2 BANJARMASIN · 7 Kebiasaan Anak Indonesia Hebat
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start sm:flex-col sm:items-end sm:self-center shrink-0">
              <img
                src={SCHOOL_LOGO_PATH}
                alt="Logo SMA PGRI 2 Banjarmasin"
                referrerPolicy="no-referrer"
                className="h-16 w-16 rounded-full border-2 border-[#D1B18B] bg-white object-contain p-1 shadow-md"
              />
              <p className="text-xs font-semibold text-[#D1B18B] sm:text-right">
                SMA PGRI 2 Banjarmasin
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
