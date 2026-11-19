import { useMemo, useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { DIMENSIONS, DimensionKey, ITEM_STATS, SCALE_LABELS } from '../data/surveyData';
import {
  DashboardMetrics,
  formatScaleChoice,
  getItemStatus,
} from '../utils/analytics';

interface HabitAnalysisSectionProps {
  metrics: DashboardMetrics;
  selectedDimension: DimensionKey | 'ALL';
  onSelectDimension: (dim: DimensionKey | 'ALL') => void;
}

type SortKey = 'default' | 'high' | 'low';

export function HabitAnalysisSection({
  metrics,
  selectedDimension,
  onSelectDimension,
}: HabitAnalysisSectionProps) {
  const [sortBy, setSortBy] = useState<SortKey>('default');
  const [onlyNegative, setOnlyNegative] = useState(false);

  const displayedItems = useMemo(() => {
    let list = ITEM_STATS.filter((it) => {
      if (selectedDimension !== 'ALL' && it.dim !== selectedDimension) return false;
      if (onlyNegative && !it.neg) return false;
      return true;
    });

    if (sortBy === 'high') {
      list = [...list].sort((a, b) => b.meanRev - a.meanRev);
    } else if (sortBy === 'low') {
      list = [...list].sort((a, b) => a.meanRev - b.meanRev);
    }

    return list;
  }, [selectedDimension, sortBy, onlyNegative]);

  return (
    <section id="kebiasaan" className="scroll-mt-24">
      <div className="glass-surface rounded-3xl p-6 sm:p-8">
        <div>
          <p className="text-xs font-semibold text-[#8B5E3C] dark:text-[#D1B18B]">
            Analisis Statistik 21 Pernyataan · 765 Pengisian
          </p>
          <h2
            style={{ fontFamily: 'var(--font-display)' }}
            className="mt-1 text-xl font-bold tracking-tight text-[#1B3A4B] dark:text-[#F7EFE7] sm:text-2xl"
          >
            Analisis Kebiasaan Siswa: Rata-rata, Sering Dilakukan &amp; Jarang Dilakukan
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            <span className="font-semibold text-[#1B3A4B] dark:text-[#F7EFE7]">Cara baca:</span>{' '}
            Rata-rata = skor rata-rata 1–4 · Sering Dilakukan = jawaban yang paling banyak dipilih
            siswa · Jarang Dilakukan = jawaban yang paling sedikit dipilih siswa. Untuk pernyataan
            negatif (*), skor dibalik (<span className="font-mono">5 − mentah</span>) agar nilai
            tinggi selalu bermakna positif.
          </p>
        </div>

        {/* 4-column statistical summary strip */}
        <div className="mt-6 grid grid-cols-1 gap-4 border-y border-[#1B3A4B]/10 py-5 dark:border-[#729BA3]/25 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Rata-rata Tertinggi
            </p>
            <p className="font-mono text-2xl font-bold tabular-nums text-[#1B3A4B] dark:text-[#F7EFE7]">
              {metrics.highestItem.meanRev.toFixed(2)}
              <span className="ml-1 text-xs font-normal text-slate-500 dark:text-slate-400">
                / 4.00
              </span>
            </p>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {metrics.highestItem.col} ({metrics.highestItem.dim})
            </p>
          </div>

          <div className="space-y-1 sm:border-l sm:border-[#1B3A4B]/10 sm:pl-4 dark:sm:border-[#729BA3]/25">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Rata-rata Terendah
            </p>
            <p className="font-mono text-2xl font-bold tabular-nums text-rose-700 dark:text-rose-400">
              {metrics.lowestItem.meanRev.toFixed(2)}
              <span className="ml-1 text-xs font-normal text-slate-500 dark:text-slate-400">
                / 4.00
              </span>
            </p>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {metrics.lowestItem.col} ({metrics.lowestItem.dim})
            </p>
          </div>

          <div className="space-y-1 lg:border-l lg:border-[#1B3A4B]/10 lg:pl-4 dark:lg:border-[#729BA3]/25">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Sering Dilakukan (Modus)
            </p>
            <p className="font-mono text-2xl font-bold tabular-nums text-[#2E5A74] dark:text-[#729BA3]">
              Skala {metrics.overallModeScale}
              <span className="ml-1.5 font-sans text-sm font-semibold text-[#1B3A4B] dark:text-[#F7EFE7]">
                ({SCALE_LABELS[metrics.overallModeScale]})
              </span>
            </p>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              Jawaban terbanyak pada {metrics.overallModeCount} dari 21 pernyataan survei
            </p>
          </div>

          <div className="space-y-1 sm:border-l sm:border-[#1B3A4B]/10 sm:pl-4 dark:sm:border-[#729BA3]/25">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Jarang Dilakukan (Paling Sedikit)
            </p>
            <p className="font-mono text-2xl font-bold tabular-nums text-[#8B5E3C] dark:text-[#D1B18B]">
              Skala {metrics.overallLeastScale}
              <span className="ml-1.5 font-sans text-sm font-semibold text-[#1B3A4B] dark:text-[#F7EFE7]">
                ({SCALE_LABELS[metrics.overallLeastScale]})
              </span>
            </p>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              Jawaban paling sedikit pada {metrics.overallLeastCount} dari 21 pernyataan
            </p>
          </div>
        </div>

        {/* Filter & Sort Controls */}
        <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                onSelectDimension('ALL');
                setOnlyNegative(false);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedDimension === 'ALL' && !onlyNegative
                  ? 'bg-[#1B3A4B] text-white dark:bg-[#D1B18B] dark:text-[#1B3A4B]'
                  : 'bg-[#F7EFE7] text-[#1B3A4B] hover:bg-[#EFE2D3] dark:bg-[#0F1E2A] dark:text-slate-200 dark:hover:bg-[#1B3A4B]'
              }`}
            >
              Semua Dimensi
            </button>
            {DIMENSIONS.map((dim) => (
              <button
                key={dim}
                type="button"
                onClick={() => {
                  onSelectDimension(dim);
                  setOnlyNegative(false);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedDimension === dim && !onlyNegative
                    ? 'bg-[#2E5A74] text-white dark:bg-[#729BA3] dark:text-[#0F1E2A]'
                    : 'bg-[#F7EFE7] text-[#1B3A4B] hover:bg-[#EFE2D3] dark:bg-[#0F1E2A] dark:text-slate-200 dark:hover:bg-[#1B3A4B]'
                }`}
              >
                {dim}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setOnlyNegative((prev) => !prev);
                onSelectDimension('ALL');
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                onlyNegative
                  ? 'bg-[#8B5E3C] text-white'
                  : 'bg-[#F7EFE7] text-[#8B5E3C] hover:bg-[#EFE2D3] dark:bg-[#0F1E2A] dark:text-[#D1B18B] dark:hover:bg-[#1B3A4B]'
              }`}
            >
              Pernyataan Negatif (4)
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" aria-hidden="true" />
            <label htmlFor="habit-sort" className="sr-only">
              Urutkan pernyataan
            </label>
            <select
              id="habit-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="rounded-xl border border-[#729BA3]/50 bg-[#FFFDF8] px-3 py-2 text-xs font-semibold text-[#1B3A4B] focus:border-[#2E5A74] focus:outline-none dark:border-[#729BA3]/40 dark:bg-[#0F1E2A] dark:text-[#F7EFE7]"
            >
              <option value="default">Urutan Survei</option>
              <option value="high">Rata-rata Tertinggi</option>
              <option value="low">Rata-rata Terendah</option>
            </select>
          </div>
        </div>

        {/* High-Density Data Table */}
        <div className="mt-5 overflow-x-auto rounded-2xl border border-[#D1B18B]/50 bg-[#FFFDF8] dark:border-[#729BA3]/30 dark:bg-[#102332]">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-[#1B3A4B] text-xs font-semibold text-[#F7EFE7]">
                <th className="px-4 py-3.5">Pernyataan Survei</th>
                <th className="px-4 py-3.5">Dimensi</th>
                <th className="bg-[#D1B18B] px-4 py-3.5 text-right text-[#1B3A4B]">
                  Rata-rata Mentah
                </th>
                <th className="bg-[#D1B18B] px-4 py-3.5 text-right text-[#1B3A4B]">
                  Rata-rata Dibalik
                </th>
                <th className="px-4 py-3.5">Sering Dilakukan</th>
                <th className="px-4 py-3.5">Jarang Dilakukan</th>
                <th className="px-4 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DDD0] dark:divide-[#2E5A74]/40">
              {displayedItems.map((item) => {
                const status = getItemStatus(item);
                const progressPct = Math.min(100, Math.max(0, (item.meanRev / 4) * 100));
                return (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-[#F7EFE7]/75 dark:hover:bg-[#1B3A4B]/60"
                  >
                    <td className="px-4 py-3.5 font-medium text-[#1B3A4B] dark:text-[#F7EFE7]">
                      <span>{item.col}</span>
                      {item.neg && (
                        <span className="ml-1.5 text-xs font-semibold text-[#8B5E3C] dark:text-[#D1B18B]">
                          (Negatif *)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {item.dim}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-xs font-semibold tabular-nums text-slate-700 dark:text-slate-200">
                      {item.meanRaw.toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="inline-flex flex-col items-end gap-1">
                        <span className="font-mono text-xs font-bold tabular-nums text-[#1B3A4B] dark:text-[#D1B18B]">
                          {item.meanRev.toFixed(2)}
                        </span>
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#E8DDD0] dark:bg-[#1B3A4B]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#1B3A4B] to-[#729BA3] dark:from-[#729BA3] dark:to-[#D1B18B]"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs font-semibold tabular-nums text-[#2E5A74] dark:text-[#729BA3] whitespace-nowrap">
                      {formatScaleChoice(item.mode)}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs font-medium tabular-nums text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {formatScaleChoice(item.least)}
                    </td>
                    <td
                      className={`px-4 py-3.5 text-xs font-semibold whitespace-nowrap ${
                        status.toneClass
                      } dark:brightness-125`}
                    >
                      {status.label}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
