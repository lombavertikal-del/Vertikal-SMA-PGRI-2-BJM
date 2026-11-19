import {
  DIMENSIONS,
  DimensionKey,
  ITEM_STATS,
  SCALE_LABELS,
  STUDENTS,
  StudentRecord,
  SurveyItemStat,
  TOTAL_RESPONSES,
  TOTAL_STUDENTS,
} from '../data/surveyData';

export type ScoreCategory =
  | 'Sangat Baik'
  | 'Baik'
  | 'Cukup'
  | 'Perlu Dibina'
  | 'Data Kosong';

export function getScoreCategory(score: number | null): ScoreCategory {
  if (score === null) return 'Data Kosong';
  if (score >= 3.3) return 'Sangat Baik';
  if (score >= 2.7) return 'Baik';
  if (score >= 2.3) return 'Cukup';
  return 'Perlu Dibina';
}

export function getCategoryTextColor(score: number | null): string {
  if (score === null) return 'text-slate-500';
  if (score >= 3.3) return 'text-emerald-700';
  if (score >= 2.7) return 'text-sky-700';
  if (score >= 2.3) return 'text-amber-700';
  return 'text-rose-700';
}

export function getItemStatus(item: SurveyItemStat): {
  label: string;
  toneClass: string;
} {
  if (item.neg) {
    if (item.meanRev >= 3.0) {
      return { label: 'Negatif Rendah (Baik)', toneClass: 'text-emerald-700' };
    }
    if (item.meanRev >= 2.7) {
      return { label: 'Negatif Sedang', toneClass: 'text-amber-700' };
    }
    return { label: 'Negatif Tinggi (Perlu Pembinaan)', toneClass: 'text-rose-700' };
  }
  if (item.meanRev >= 3.2) {
    return { label: 'Sangat Baik', toneClass: 'text-emerald-700' };
  }
  if (item.meanRev >= 2.9) {
    return { label: 'Baik', toneClass: 'text-sky-700' };
  }
  if (item.meanRev >= 2.7) {
    return { label: 'Cukup', toneClass: 'text-amber-700' };
  }
  return { label: 'Perlu Perhatian', toneClass: 'text-rose-700' };
}

export function formatScore(value: number | null): string {
  if (value === null || Number.isNaN(value)) return '—';
  return value.toFixed(2);
}

export function formatScaleChoice(scale: number): string {
  return `${scale} (${SCALE_LABELS[scale] ?? ''})`;
}

export interface DimensionSummary {
  dimension: DimensionKey;
  mean: number;
  rawMean: number;
  dominantMode: number;
  dominantLeast: number;
  itemCount: number;
}

export interface ClassSummary {
  kelas: string;
  mean: number;
  studentCount: number;
  responseCount: number;
}

export interface DashboardMetrics {
  totalResponses: number;
  totalStudents: number;
  validStudentCount: number;
  overallMean: number;
  overallCategory: ScoreCategory;
  classList: string[];
  classSummaries: ClassSummary[];
  highestClass: ClassSummary;
  lowestClass: ClassSummary;
  dimensionSummaries: DimensionSummary[];
  strongestDimensions: DimensionSummary[];
  weakestDimensions: DimensionSummary[];
  highestItem: SurveyItemStat;
  lowestItem: SurveyItemStat;
  overallModeScale: number;
  overallModeCount: number;
  overallLeastScale: number;
  overallLeastCount: number;
  categoryCounts: Record<ScoreCategory, number>;
  negativeItems: SurveyItemStat[];
}

export function computeDashboardMetrics(): DashboardMetrics {
  const validStudents = STUDENTS.filter((s) => s.skor !== null);
  const overallMean =
    validStudents.reduce((sum, s) => sum + (s.skor ?? 0), 0) / validStudents.length;

  const classMap = new Map<
    string,
    { scores: number[]; studentCount: number; responseCount: number }
  >();

  STUDENTS.forEach((s) => {
    const entry = classMap.get(s.kelas) ?? {
      scores: [],
      studentCount: 0,
      responseCount: 0,
    };
    entry.studentCount += 1;
    entry.responseCount += s.jumlah;
    if (s.skor !== null) {
      entry.scores.push(s.skor);
    }
    classMap.set(s.kelas, entry);
  });

  const classSummaries: ClassSummary[] = Array.from(classMap.entries())
    .map(([kelas, data]) => ({
      kelas,
      mean:
        data.scores.length > 0
          ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length
          : 0,
      studentCount: data.studentCount,
      responseCount: data.responseCount,
    }))
    .sort((a, b) => b.mean - a.mean);

  const classOrder = ['X-1', 'X-2', 'X-3', 'XI-1', 'XI-2', 'XI-3', 'XII-1', 'XII-2', 'XII-3'];
  const classList = Array.from(classMap.keys()).sort((a, b) => {
    const ia = classOrder.indexOf(a);
    const ib = classOrder.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    return a.localeCompare(b);
  });

  const dimensionSummaries: DimensionSummary[] = DIMENSIONS.map((dim) => {
    const items = ITEM_STATS.filter((it) => it.dim === dim);
    const mean = items.reduce((sum, it) => sum + it.meanRev, 0) / items.length;
    const rawMean = items.reduce((sum, it) => sum + it.meanRaw, 0) / items.length;

    const modeFreq: Record<number, number> = {};
    const leastFreq: Record<number, number> = {};
    items.forEach((it) => {
      modeFreq[it.mode] = (modeFreq[it.mode] ?? 0) + 1;
      leastFreq[it.least] = (leastFreq[it.least] ?? 0) + 1;
    });

    const dominantMode = Number(
      Object.entries(modeFreq).sort((a, b) => b[1] - a[1])[0][0]
    );
    const dominantLeast = Number(
      Object.entries(leastFreq).sort((a, b) => b[1] - a[1])[0][0]
    );

    return {
      dimension: dim,
      mean,
      rawMean,
      dominantMode,
      dominantLeast,
      itemCount: items.length,
    };
  });

  const sortedDims = [...dimensionSummaries].sort((a, b) => b.mean - a.mean);
  const sortedItems = [...ITEM_STATS].sort((a, b) => b.meanRev - a.meanRev);

  const globalModeFreq: Record<number, number> = {};
  const globalLeastFreq: Record<number, number> = {};
  ITEM_STATS.forEach((it) => {
    globalModeFreq[it.mode] = (globalModeFreq[it.mode] ?? 0) + 1;
    globalLeastFreq[it.least] = (globalLeastFreq[it.least] ?? 0) + 1;
  });

  const topMode = Object.entries(globalModeFreq).sort((a, b) => b[1] - a[1])[0];
  const topLeast = Object.entries(globalLeastFreq).sort((a, b) => b[1] - a[1])[0];

  const categoryCounts: Record<ScoreCategory, number> = {
    'Sangat Baik': 0,
    Baik: 0,
    Cukup: 0,
    'Perlu Dibina': 0,
    'Data Kosong': 0,
  };

  STUDENTS.forEach((s) => {
    categoryCounts[getScoreCategory(s.skor)] += 1;
  });

  return {
    totalResponses: TOTAL_RESPONSES,
    totalStudents: TOTAL_STUDENTS,
    validStudentCount: validStudents.length,
    overallMean,
    overallCategory: getScoreCategory(overallMean),
    classList,
    classSummaries,
    highestClass: classSummaries[0],
    lowestClass: classSummaries[classSummaries.length - 1],
    dimensionSummaries,
    strongestDimensions: sortedDims.slice(0, 3),
    weakestDimensions: sortedDims.slice(-3).reverse(),
    highestItem: sortedItems[0],
    lowestItem: sortedItems[sortedItems.length - 1],
    overallModeScale: Number(topMode[0]),
    overallModeCount: topMode[1],
    overallLeastScale: Number(topLeast[0]),
    overallLeastCount: topLeast[1],
    categoryCounts,
    negativeItems: ITEM_STATS.filter((it) => it.neg),
  };
}

export function getStudentRecommendation(student: StudentRecord): {
  strongest: [DimensionKey, number] | null;
  weakest: [DimensionKey, number] | null;
  advice: string;
} {
  const validEntries = (
    Object.entries(student.dimensi) as Array<[DimensionKey, number | null]>
  ).filter((entry): entry is [DimensionKey, number] => entry[1] !== null);

  if (validEntries.length === 0) {
    return {
      strongest: null,
      weakest: null,
      advice: 'Data dimensi belum lengkap untuk menyusun rekomendasi individual.',
    };
  }

  const sorted = [...validEntries].sort((a, b) => a[1] - b[1]);
  const weakest = sorted[0];
  const strongest = sorted[sorted.length - 1];

  const tips: Record<DimensionKey, string> = {
    'Bangun Pagi':
      'Biasakan bangun 15 menit lebih awal sebelum pukul 06.00 dan rapikan tempat tidur sendiri sebelum menyentuh HP.',
    Beribadah:
      'Tetapkan pengingat waktu ibadah, ajak teman beribadah bersama, dan kurangi scrolling HP saat waktu ibadah.',
    Berolahraga:
      'Lakukan jalan kaki jarak dekat atau senam 15 menit minimal 3 kali seminggu serta pemanasan sebelum berolahraga.',
    'Makan Sehat dan Bergizi':
      'Prioritaskan membawa air putih dibandingkan minuman manis, kurangi jajanan kurang sehat, dan habiskan porsi MBG tanpa sisa.',
    'Gemar Belajar':
      'Latih kebiasaan mengajukan minimal satu pertanyaan berbobot tiap pelajaran dan mencari referensi mandiri sebelum bertanya.',
    Bermasyarakat:
      'Pertahankan sikap ramah dengan menyapa teman serta aktif berpartisipasi dalam organisasi atau ekstrakurikuler sekolah.',
    'Tidur Cepat':
      'Terapkan kebiasaan "HP tidur duluan" pukul 21.00 agar durasi istirahat 7–8 jam tercapai dengan kualitas tidur yang baik.',
  };

  return {
    strongest,
    weakest,
    advice: `Fokus pembinaan utama berada pada dimensi ${weakest[0]} (skor ${weakest[1].toFixed(2)}). ${tips[weakest[0]]}`,
  };
}

export function exportStudentsToCSV(students: StudentRecord[]): void {
  const headers = [
    'Nama',
    'Kelas',
    'Email',
    'Jumlah Pengisian',
    'Skor Rata-rata',
    'Kategori',
    ...DIMENSIONS,
  ];

  const escapeCell = (val: string | number | null) => {
    const str = val === null ? '' : String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = students.map((s) => [
    s.nama,
    s.kelas,
    s.email,
    s.jumlah,
    s.skor !== null ? s.skor.toFixed(2) : '',
    getScoreCategory(s.skor),
    ...DIMENSIONS.map((d) => (s.dimensi[d] !== null ? s.dimensi[d]!.toFixed(2) : '')),
  ]);

  const csvContent =
    '\uFEFF' +
    [headers.map(escapeCell).join(','), ...rows.map((r) => r.map(escapeCell).join(','))].join(
      '\n'
    );

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'VERTIKAL_SMAGRIDA_Data_Survei_Siswa.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
