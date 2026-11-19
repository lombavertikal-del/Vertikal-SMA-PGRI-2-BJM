import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  Camera,
  ChevronRight,
  MessageSquarePlus,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { DIMENSIONS, DimensionKey, STUDENTS, StudentRecord } from '../data/surveyData';
import {
  DimensionSummary,
  ScoreCategory,
  formatScore,
  getCategoryTextColor,
  getScoreCategory,
  getStudentRecommendation,
} from '../utils/analytics';

export interface FeedbackEntry {
  id: string;
  studentCode: string;
  studentName: string;
  kategori: DimensionKey;
  oleh: string;
  isi: string;
  tgl: string;
}

interface StudentDirectorySectionProps {
  classList: string[];
  overallMean: number;
  dimensionSummaries: DimensionSummary[];
  feedbacks: FeedbackEntry[];
  onAddFeedback: (entry: Omit<FeedbackEntry, 'id' | 'tgl'>) => void;
  onDeleteFeedback: (id: string) => void;
  onFilteredChange?: (filtered: StudentRecord[]) => void;
}

type SortOption = 'score-desc' | 'score-asc' | 'name-asc' | 'count-desc';

const CATEGORY_OPTIONS: Array<'ALL' | ScoreCategory> = [
  'ALL',
  'Sangat Baik',
  'Baik',
  'Cukup',
  'Perlu Dibina',
];

const FEEDBACK_ROLES = ['Guru BK', 'Wali Kelas', 'Guru Piket', 'Teman / OSIS'];

const AVATAR_STORAGE_KEY = 'vertikal_smagrida_avatars_v1';

export function getStudentCode(id: number): string {
  return `S-${String(id).padStart(3, '0')}`;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'S';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function StudentDirectorySection({
  classList,
  overallMean,
  dimensionSummaries,
  feedbacks,
  onAddFeedback,
  onDeleteFeedback,
  onFilteredChange,
}: StudentDirectorySectionProps) {
  const [query, setQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | ScoreCategory>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [visibleCount, setVisibleCount] = useState(25);
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);

  // Avatar map in localStorage
  const [avatars, setAvatars] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem(AVATAR_STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  });

  // Feedback form state
  const [fbKategori, setFbKategori] = useState<DimensionKey>('Gemar Belajar');
  const [fbOleh, setFbOleh] = useState<string>('Guru BK');
  const [fbIsi, setFbIsi] = useState('');
  const [fbNotice, setFbNotice] = useState<string | null>(null);

  const detailRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(AVATAR_STORAGE_KEY, JSON.stringify(avatars));
    } catch {
      // Ignore storage quota errors silently
    }
  }, [avatars]);

  const dimAvgMap = useMemo(() => {
    const map = new Map<string, number>();
    dimensionSummaries.forEach((d) => map.set(d.dimension, d.mean));
    return map;
  }, [dimensionSummaries]);

  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = STUDENTS.filter((s) => {
      const code = getStudentCode(s.id).toLowerCase();
      const matchesQuery =
        !q ||
        s.nama.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.kelas.toLowerCase().includes(q) ||
        code.includes(q);
      const matchesClass = !selectedClass || s.kelas === selectedClass;
      const matchesCategory =
        selectedCategory === 'ALL' || getScoreCategory(s.skor) === selectedCategory;
      return matchesQuery && matchesClass && matchesCategory;
    });

    const sorted = [...list].sort((a, b) => {
      if (sortBy === 'score-desc') return (b.skor ?? -1) - (a.skor ?? -1);
      if (sortBy === 'score-asc') return (a.skor ?? 99) - (b.skor ?? 99);
      if (sortBy === 'count-desc') {
        return b.jumlah - a.jumlah || (b.skor ?? 0) - (a.skor ?? 0);
      }
      return a.nama.localeCompare(b.nama, 'id');
    });

    onFilteredChange?.(sorted);
    return sorted;
  }, [query, selectedClass, selectedCategory, sortBy, onFilteredChange]);

  const displayedStudents = useMemo(
    () => filteredStudents.slice(0, visibleCount),
    [filteredStudents, visibleCount]
  );

  const hasActiveFilters =
    query.trim() !== '' || selectedClass !== '' || selectedCategory !== 'ALL';

  const handleResetFilters = () => {
    setQuery('');
    setSelectedClass('');
    setSelectedCategory('ALL');
    setSortBy('name-asc');
    setVisibleCount(25);
  };

  const handleSelectStudent = (student: StudentRecord) => {
    setSelectedStudent(student);
    setFbNotice(null);
    const rec = getStudentRecommendation(student);
    if (rec.weakest) {
      setFbKategori(rec.weakest[0]);
    }
    requestAnimationFrame(() => {
      detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  };

  const handleAvatarUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (!selectedStudent || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    const code = getStudentCode(selectedStudent.id);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatars((prev) => ({ ...prev, [code]: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    if (!selectedStudent) return;
    const code = getStudentCode(selectedStudent.id);
    setAvatars((prev) => {
      const next = { ...prev };
      delete next[code];
      return next;
    });
  };

  const studentRec = useMemo(
    () => (selectedStudent ? getStudentRecommendation(selectedStudent) : null),
    [selectedStudent]
  );

  const selectedCode = selectedStudent ? getStudentCode(selectedStudent.id) : '';
  const studentFeedbacks = useMemo(
    () => feedbacks.filter((f) => f.studentCode === selectedCode),
    [feedbacks, selectedCode]
  );

  const handleAutoSuggestion = () => {
    if (!selectedStudent || !studentRec) return;
    setFbIsi(studentRec.advice);
    if (studentRec.weakest) {
      setFbKategori(studentRec.weakest[0]);
    }
    setFbNotice(null);
  };

  const handleSaveFeedback = () => {
    if (!selectedStudent) return;
    const trimmed = fbIsi.trim();
    if (!trimmed) {
      setFbNotice('Tuliskan saran pembinaan terlebih dahulu sebelum menyimpan.');
      return;
    }
    onAddFeedback({
      studentCode: getStudentCode(selectedStudent.id),
      studentName: selectedStudent.nama,
      kategori: fbKategori,
      oleh: fbOleh,
      isi: trimmed,
    });
    setFbIsi('');
    setFbNotice(`Saran pembinaan untuk ${selectedStudent.nama} (${selectedCode}) berhasil disimpan.`);
  };

  return (
    <section id="siswa" className="scroll-mt-24">
      <div className="glass-surface rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold text-[#8B5E3C] dark:text-[#D1B18B]">
              Direktori Responden · {STUDENTS.length} Siswa Asli (S-001 s.d. S-308)
            </p>
            <h2
              style={{ fontFamily: 'var(--font-display)' }}
              className="mt-1 text-xl font-bold tracking-tight text-[#1B3A4B] dark:text-[#F7EFE7] sm:text-2xl"
            >
              Pencarian Data Siswa, Foto Profil &amp; Feedback Pembinaan
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Cari menggunakan nama, kode siswa (contoh: S-001), email, atau kelas. Klik
              baris siswa untuk melihat profil 7 dimensi, mengganti foto profil, dan
              menulis saran pembinaan.
            </p>
          </div>
          <p className="font-mono text-xs font-semibold tabular-nums text-[#1B3A4B] dark:text-[#D1B18B] shrink-0">
            Ditemukan: {filteredStudents.length} / {STUDENTS.length} siswa
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="relative md:col-span-5">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <label htmlFor="student-search" className="sr-only">
              Cari nama, kode, kelas, atau email siswa
            </label>
            <input
              id="student-search"
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setVisibleCount(25);
              }}
              placeholder="Ketik nama, kode (S-001), email, atau kelas..."
              className="w-full rounded-xl border border-[#729BA3]/60 bg-[#FFFDF8] py-2.5 pl-10 pr-9 text-sm text-[#1B3A4B] placeholder:text-slate-400 focus:border-[#2E5A74] focus:outline-none focus:ring-2 focus:ring-[#729BA3]/30 dark:border-[#729BA3]/40 dark:bg-[#0F1E2A] dark:text-[#F7EFE7]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Hapus pencarian"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-[#F7EFE7] hover:text-[#1B3A4B] dark:hover:bg-[#1B3A4B] dark:hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="md:col-span-3">
            <label htmlFor="class-filter" className="sr-only">
              Filter kelas
            </label>
            <select
              id="class-filter"
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setVisibleCount(25);
              }}
              className="w-full rounded-xl border border-[#729BA3]/60 bg-[#FFFDF8] px-3.5 py-2.5 text-sm font-medium text-[#1B3A4B] focus:border-[#2E5A74] focus:outline-none focus:ring-2 focus:ring-[#729BA3]/30 dark:border-[#729BA3]/40 dark:bg-[#0F1E2A] dark:text-[#F7EFE7]"
            >
              <option value="">Semua Kelas (9 Kelas)</option>
              {classList.map((kelas) => (
                <option key={kelas} value={kelas}>
                  Kelas {kelas}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label htmlFor="student-sort" className="sr-only">
              Urutkan siswa
            </label>
            <select
              id="student-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full rounded-xl border border-[#729BA3]/60 bg-[#FFFDF8] px-3.5 py-2.5 text-sm font-medium text-[#1B3A4B] focus:border-[#2E5A74] focus:outline-none focus:ring-2 focus:ring-[#729BA3]/30 dark:border-[#729BA3]/40 dark:bg-[#0F1E2A] dark:text-[#F7EFE7]"
            >
              <option value="name-asc">Urutkan: Nama (A–Z)</option>
              <option value="score-desc">Urutkan: Skor Tertinggi</option>
              <option value="score-asc">Urutkan: Skor Terendah</option>
              <option value="count-desc">Urutkan: Pengisian Terbanyak</option>
            </select>
          </div>

          <div className="md:col-span-1 flex items-stretch">
            <button
              type="button"
              onClick={handleResetFilters}
              disabled={!hasActiveFilters && sortBy === 'name-asc'}
              title="Reset semua filter"
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#729BA3]/60 bg-[#FFFDF8] px-3 py-2.5 text-xs font-semibold text-[#1B3A4B] transition-colors hover:bg-[#F7EFE7] disabled:cursor-not-allowed disabled:opacity-45 dark:border-[#729BA3]/40 dark:bg-[#0F1E2A] dark:text-[#F7EFE7] dark:hover:bg-[#1B3A4B] cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="md:hidden">Reset</span>
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {CATEGORY_OPTIONS.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setSelectedCategory(cat);
                setVisibleCount(25);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#1B3A4B] text-white dark:bg-[#D1B18B] dark:text-[#1B3A4B]'
                  : 'bg-[#F7EFE7] text-[#1B3A4B] hover:bg-[#EFE2D3] dark:bg-[#0F1E2A] dark:text-slate-200 dark:hover:bg-[#1B3A4B]'
              }`}
            >
              {cat === 'ALL' ? 'Semua Kategori' : cat}
            </button>
          ))}
        </div>

        {/* Selected Student Detail Drawer + Avatar + Feedback Form */}
        {selectedStudent && studentRec && (
          <div
            ref={detailRef}
            className="mt-5 rounded-2xl border-2 border-[#729BA3]/60 bg-[#FFFDF8] p-5 sm:p-6 shadow-md dark:border-[#729BA3]/40 dark:bg-[#102332]"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-wrap items-center gap-4">
                {/* Student Avatar */}
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-[#D1B18B] bg-gradient-to-br from-[#2E5A74] to-[#8B5E3C] text-white shadow-md flex items-center justify-center">
                  {avatars[selectedCode] ? (
                    <img
                      src={avatars[selectedCode]}
                      alt={`Foto profil ${selectedStudent.nama}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span
                      style={{ fontFamily: 'var(--font-display)' }}
                      className="text-2xl font-bold"
                    >
                      {getInitials(selectedStudent.nama)}
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#8B5E3C] dark:text-[#D1B18B]">
                    <span className="font-mono font-bold">{selectedCode}</span>
                    <span aria-hidden="true">·</span>
                    <span>Kelas {selectedStudent.kelas}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">
                      {selectedStudent.jumlah}x pengisian
                    </span>
                  </div>
                  <h3
                    style={{ fontFamily: 'var(--font-display)' }}
                    className="mt-0.5 text-lg font-bold text-[#1B3A4B] dark:text-[#F7EFE7] sm:text-xl"
                  >
                    {selectedStudent.nama}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedStudent.email}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#729BA3]/60 bg-[#F7EFE7] px-3 py-1.5 text-xs font-semibold text-[#1B3A4B] transition-colors hover:bg-[#EFE2D3] dark:border-[#729BA3]/40 dark:bg-[#1B3A4B] dark:text-[#F7EFE7] dark:hover:bg-[#2E5A74]">
                      <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                      Ganti Foto Profil
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                    </label>
                    {avatars[selectedCode] && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="inline-flex items-center gap-1 rounded-lg bg-rose-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-rose-800 cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" aria-hidden="true" />
                        Hapus Foto
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-start justify-between gap-4 sm:justify-end">
                <div className="text-left sm:text-right">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Skor Rata-rata</p>
                  <p className="font-mono text-2xl font-bold tabular-nums text-[#1B3A4B] dark:text-[#F7EFE7]">
                    {formatScore(selectedStudent.skor)}
                    <span className="ml-1 text-xs font-normal text-slate-500 dark:text-slate-400">
                      / 4.00
                    </span>
                  </p>
                  <p
                    className={`text-xs font-semibold ${getCategoryTextColor(
                      selectedStudent.skor
                    )} dark:brightness-125`}
                  >
                    {getScoreCategory(selectedStudent.skor)}
                    {selectedStudent.skor !== null && (
                      <span className="ml-1 font-mono font-normal text-slate-500 dark:text-slate-400">
                        ({selectedStudent.skor >= overallMean ? '+' : ''}
                        {(selectedStudent.skor - overallMean).toFixed(2)} vs sekolah)
                      </span>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  aria-label="Tutup profil siswa"
                  className="rounded-xl border border-[#D1B18B]/60 bg-white p-2 text-slate-500 transition-colors hover:bg-[#F7EFE7] hover:text-[#1B3A4B] dark:border-[#729BA3]/40 dark:bg-[#0F1E2A] dark:text-slate-300 dark:hover:text-white cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* 7 Dimensions Progress Grid */}
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {DIMENSIONS.map((dim) => {
                const val = selectedStudent.dimensi[dim];
                const schoolVal = dimAvgMap.get(dim) ?? 0;
                const pct = val !== null ? Math.min(100, (val / 4) * 100) : 0;
                const diff = val !== null ? val - schoolVal : null;
                return (
                  <div
                    key={dim}
                    className="rounded-xl border border-[#E8DDD0] bg-[#F7EFE7]/65 p-3.5 dark:border-[#2E5A74]/60 dark:bg-[#0F1E2A]/80"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        {dim}
                      </span>
                      <span className="font-mono text-sm font-bold tabular-nums text-[#1B3A4B] dark:text-[#D1B18B]">
                        {formatScore(val)}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#E8DDD0] dark:bg-[#1B3A4B]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#1B3A4B] to-[#729BA3] dark:from-[#729BA3] dark:to-[#D1B18B]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="mt-1.5 font-mono text-[11px] tabular-nums text-slate-500 dark:text-slate-400">
                      {diff !== null
                        ? `${diff >= 0 ? '+' : ''}${diff.toFixed(2)} vs rata-rata (${schoolVal.toFixed(2)})`
                        : 'Tidak terisi pada survei asli'}
                    </p>
                  </div>
                );
              })}

              {/* Recommendation Cell */}
              <div className="rounded-xl bg-[#1B3A4B] p-3.5 text-[#F7EFE7]">
                <p className="text-xs font-semibold text-[#D1B18B]">Rekomendasi Otomatis</p>
                <p className="mt-1 text-xs leading-relaxed text-[#F7EFE7]/95">
                  {studentRec.advice}
                </p>
              </div>
            </div>

            {/* Integrated Feedback / Saran Pembinaan Form */}
            <div className="mt-5 rounded-2xl border border-dashed border-[#8B5E3C] bg-[#FFF8EB] p-4 sm:p-5 dark:border-[#D1B18B]/50 dark:bg-[#1A2E3B]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <MessageSquarePlus className="h-4 w-4 text-[#8B5E3C] dark:text-[#D1B18B]" aria-hidden="true" />
                  <h4 className="text-sm font-bold text-[#1B3A4B] dark:text-[#F7EFE7]">
                    Form Feedback / Saran Pembinaan Siswa
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={handleAutoSuggestion}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#8B5E3C] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#734C2F] cursor-pointer whitespace-nowrap"
                >
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  Isi Saran Otomatis
                </button>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="fb-kategori" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Dimensi Fokus
                  </label>
                  <select
                    id="fb-kategori"
                    value={fbKategori}
                    onChange={(e) => setFbKategori(e.target.value as DimensionKey)}
                    className="mt-1 w-full rounded-xl border border-[#729BA3]/60 bg-white px-3 py-2 text-xs font-semibold text-[#1B3A4B] focus:border-[#2E5A74] focus:outline-none dark:border-[#729BA3]/40 dark:bg-[#0F1E2A] dark:text-[#F7EFE7]"
                  >
                    {DIMENSIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="fb-oleh" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Pemberi Saran
                  </label>
                  <select
                    id="fb-oleh"
                    value={fbOleh}
                    onChange={(e) => setFbOleh(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#729BA3]/60 bg-white px-3 py-2 text-xs font-semibold text-[#1B3A4B] focus:border-[#2E5A74] focus:outline-none dark:border-[#729BA3]/40 dark:bg-[#0F1E2A] dark:text-[#F7EFE7]"
                  >
                    {FEEDBACK_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-3">
                <label htmlFor="fb-isi" className="sr-only">
                  Isi saran pembinaan
                </label>
                <textarea
                  id="fb-isi"
                  rows={2}
                  value={fbIsi}
                  onChange={(e) => setFbIsi(e.target.value)}
                  placeholder={`Tulis saran pembinaan untuk ${selectedStudent.nama}...`}
                  className="w-full rounded-xl border border-[#729BA3]/60 bg-white px-3.5 py-2.5 text-sm text-[#1B3A4B] placeholder:text-slate-400 focus:border-[#2E5A74] focus:outline-none dark:border-[#729BA3]/40 dark:bg-[#0F1E2A] dark:text-[#F7EFE7]"
                />
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleSaveFeedback}
                  className="rounded-xl bg-[#2E5A74] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#1B3A4B] cursor-pointer whitespace-nowrap"
                >
                  Simpan Saran
                </button>
                {fbNotice && (
                  <p className="text-xs font-semibold text-[#2E5A74] dark:text-[#D1B18B]">
                    {fbNotice}
                  </p>
                )}
              </div>

              {/* Existing Feedbacks for This Student */}
              {studentFeedbacks.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-[#D1B18B]/40 pt-3">
                  <p className="text-xs font-bold text-[#1B3A4B] dark:text-[#F7EFE7]">
                    Saran Tersimpan untuk {selectedStudent.nama} ({studentFeedbacks.length})
                  </p>
                  {studentFeedbacks.map((fb) => (
                    <div
                      key={fb.id}
                      className="flex items-start justify-between gap-3 rounded-xl border border-[#E8DDD0] bg-white p-3 dark:border-[#2E5A74]/50 dark:bg-[#0F1E2A]"
                    >
                      <div className="text-xs">
                        <p className="font-semibold text-[#1B3A4B] dark:text-[#D1B18B]">
                          {fb.kategori} · {fb.oleh} ·{' '}
                          <span className="font-mono font-normal text-slate-500 dark:text-slate-400">
                            {fb.tgl}
                          </span>
                        </p>
                        <p className="mt-1 text-slate-700 dark:text-slate-200">{fb.isi}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onDeleteFeedback(fb.id)}
                        aria-label="Hapus saran"
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 cursor-pointer shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Students Table or Empty State */}
        {filteredStudents.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-[#D1B18B]/50 bg-[#FFFDF8] px-6 py-12 text-center dark:border-[#729BA3]/30 dark:bg-[#102332]">
            <p className="text-base font-bold text-[#1B3A4B] dark:text-[#F7EFE7]">
              Tidak ada data siswa yang cocok
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Coba ubah kata kunci pencarian atau pilih kelas lain.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 rounded-xl bg-[#1B3A4B] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#2E5A74] cursor-pointer"
            >
              Reset Pencarian
            </button>
          </div>
        ) : (
          <>
            <div className="mt-5 overflow-x-auto rounded-2xl border border-[#D1B18B]/50 bg-[#FFFDF8] dark:border-[#729BA3]/30 dark:bg-[#102332]">
              <table className="w-full min-w-[780px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-[#1B3A4B] text-xs font-semibold text-[#F7EFE7]">
                    <th className="px-4 py-3.5">Foto</th>
                    <th className="px-4 py-3.5">Kode &amp; Nama Siswa</th>
                    <th className="bg-[#D1B18B] px-4 py-3.5 text-[#1B3A4B]">Kelas</th>
                    <th className="bg-[#D1B18B] px-4 py-3.5 text-right text-[#1B3A4B]">
                      Isi
                    </th>
                    <th className="px-4 py-3.5 text-right">Skor</th>
                    <th className="px-4 py-3.5">Kategori</th>
                    <th className="px-4 py-3.5 text-right">Profil</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DDD0] dark:divide-[#2E5A74]/40">
                  {displayedStudents.map((s) => {
                    const code = getStudentCode(s.id);
                    const isSelected = selectedStudent?.id === s.id;
                    return (
                      <tr
                        key={s.id}
                        onClick={() => handleSelectStudent(s)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#EFE2D3]/70 dark:bg-[#2E5A74]/40'
                            : 'hover:bg-[#F7EFE7]/75 dark:hover:bg-[#1B3A4B]/60'
                        }`}
                      >
                        <td className="px-4 py-2.5">
                          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-[#D1B18B] bg-gradient-to-br from-[#2E5A74] to-[#8B5E3C] text-xs font-bold text-white">
                            {avatars[code] ? (
                              <img
                                src={avatars[code]}
                                alt={s.nama}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              getInitials(s.nama)
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <p className="font-semibold text-[#1B3A4B] dark:text-[#F7EFE7]">
                            {s.nama}
                          </p>
                          <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[230px]">
                            {code} · {s.email}
                          </p>
                        </td>
                        <td className="px-4 py-2.5 font-mono text-xs font-semibold tabular-nums text-[#2E5A74] dark:text-[#729BA3] whitespace-nowrap">
                          {s.kelas}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums text-slate-700 dark:text-slate-200">
                          {s.jumlah}x
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-xs font-bold tabular-nums text-[#1B3A4B] dark:text-[#D1B18B]">
                          {formatScore(s.skor)}
                        </td>
                        <td
                          className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap ${getCategoryTextColor(
                            s.skor
                          )} dark:brightness-125`}
                        >
                          {getScoreCategory(s.skor)}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectStudent(s);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#1B3A4B] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#2E5A74] dark:bg-[#2E5A74] dark:hover:bg-[#729BA3] dark:hover:text-[#0F1E2A] whitespace-nowrap cursor-pointer"
                          >
                            Lihat
                            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
              <p className="font-mono text-xs tabular-nums text-slate-600 dark:text-slate-300">
                Menampilkan {displayedStudents.length} dari {filteredStudents.length} siswa
              </p>
              {visibleCount < filteredStudents.length && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => prev + 30)}
                    className="rounded-xl bg-[#1B3A4B] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#2E5A74] whitespace-nowrap cursor-pointer"
                  >
                    Tampilkan 30 Berikutnya
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisibleCount(filteredStudents.length)}
                    className="rounded-xl border border-[#729BA3]/60 bg-[#FFFDF8] px-4 py-2 text-xs font-semibold text-[#1B3A4B] transition-colors hover:bg-[#F7EFE7] dark:border-[#729BA3]/40 dark:bg-[#0F1E2A] dark:text-[#F7EFE7] dark:hover:bg-[#1B3A4B] whitespace-nowrap cursor-pointer"
                  >
                    Tampilkan Semua ({filteredStudents.length})
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
