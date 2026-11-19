import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DIMENSIONS, DimensionKey, ITEM_STATS, SCALE_LABELS } from '../data/surveyData';
import { ClassSummary, DimensionSummary } from '../utils/analytics';

interface InteractiveChartsProps {
  dimensionSummaries: DimensionSummary[];
  classSummaries: ClassSummary[];
  selectedDimension: DimensionKey | 'ALL';
  onSelectDimension: (dim: DimensionKey | 'ALL') => void;
  isDark: boolean;
}

type ClassSortMode = 'score' | 'order';

export function InteractiveCharts({
  dimensionSummaries,
  classSummaries,
  selectedDimension,
  onSelectDimension,
  isDark,
}: InteractiveChartsProps) {
  const [classSortMode, setClassSortMode] = useState<ClassSortMode>('score');
  const [itemMetricMode, setItemMetricMode] = useState<'meanRev' | 'compare'>('meanRev');

  const axisText = isDark ? '#E2E8F0' : '#1B3A4B';
  const axisMuted = isDark ? '#94A3B8' : '#475569';
  const gridStroke = isDark ? 'rgba(209,177,139,0.14)' : 'rgba(27,58,75,0.09)';

  const classChartData = useMemo(() => {
    const order = ['X-1', 'X-2', 'X-3', 'XI-1', 'XI-2', 'XI-3', 'XII-1', 'XII-2', 'XII-3'];
    const copy = [...classSummaries];
    if (classSortMode === 'order') {
      copy.sort((a, b) => order.indexOf(a.kelas) - order.indexOf(b.kelas));
    } else {
      copy.sort((a, b) => b.mean - a.mean);
    }
    return copy.map((c) => ({
      ...c,
      meanRounded: Number(c.mean.toFixed(2)),
    }));
  }, [classSummaries, classSortMode]);

  const dimChartData = useMemo(
    () =>
      dimensionSummaries.map((d) => ({
        ...d,
        meanRounded: Number(d.mean.toFixed(2)),
      })),
    [dimensionSummaries]
  );

  const filteredItemData = useMemo(() => {
    const list =
      selectedDimension === 'ALL'
        ? ITEM_STATS
        : ITEM_STATS.filter((it) => it.dim === selectedDimension);
    return list.map((it) => ({
      id: it.id,
      shortLabel:
        it.col.length > 34 ? `${it.col.slice(0, 34).trimEnd()}…` : it.col,
      fullLabel: it.col,
      dim: it.dim,
      meanRev: it.meanRev,
      meanRaw: it.meanRaw,
      mode: it.mode,
      least: it.least,
      neg: it.neg,
    }));
  }, [selectedDimension]);

  const getDimBarColor = (val: number) => {
    if (val >= 3.15) return isDark ? '#729BA3' : '#1B3A4B';
    if (val >= 2.95) return isDark ? '#5B8EA8' : '#2E5A74';
    if (val >= 2.8) return isDark ? '#D1B18B' : '#729BA3';
    return '#8B5E3C';
  };

  return (
    <section id="grafik" className="scroll-mt-24 space-y-6">
      <div className="glass-surface rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold text-[#8B5E3C] dark:text-[#D1B18B]">
              Visualisasi Grafik Batang · Skala 1,00–4,00
            </p>
            <h2
              style={{ fontFamily: 'var(--font-display)' }}
              className="mt-1 text-xl font-bold tracking-tight text-[#1B3A4B] dark:text-[#F7EFE7] sm:text-2xl"
            >
              Grafik Batang Hasil Survei Kebiasaan Siswa
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Seluruh grafik ditampilkan dalam format grafik batang untuk mempermudah
              perbandingan antar dimensi, antar kelas, dan antar pernyataan.
            </p>
          </div>
          {selectedDimension !== 'ALL' && (
            <button
              type="button"
              onClick={() => onSelectDimension('ALL')}
              className="self-start text-xs font-semibold text-[#2E5A74] underline underline-offset-4 hover:text-[#1B3A4B] dark:text-[#D1B18B] dark:hover:text-white whitespace-nowrap shrink-0 cursor-pointer sm:self-auto"
            >
              Reset Filter Dimensi
            </button>
          )}
        </div>

        {/* Row 1: Dimension Bar Chart + Class Bar Chart */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Chart 1: Per Dimensi (Batang) */}
          <div className="lg:col-span-7 flex flex-col border-t border-[#1B3A4B]/10 pt-5 dark:border-[#729BA3]/25">
            <div className="mb-4">
              <h3 className="text-base font-bold text-[#1B3A4B] dark:text-[#F7EFE7]">
                Grafik Batang per Dimensi (7 Kebiasaan)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Klik batang dimensi untuk memfilter grafik per pernyataan di bawah
              </p>
            </div>

            <div className="h-[310px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dimChartData}
                  margin={{ top: 10, right: 12, left: -16, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis
                    dataKey="dimension"
                    tick={{ fill: axisText, fontSize: 12, fontWeight: 600 }}
                    axisLine={{ stroke: gridStroke }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 4]}
                    ticks={[0, 1, 2, 3, 4]}
                    tick={{ fill: axisMuted, fontSize: 11, fontFamily: 'JetBrains Mono' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: isDark ? 'rgba(209,177,139,0.1)' : 'rgba(114,155,163,0.14)' }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload as DimensionSummary & { meanRounded: number };
                      return (
                        <div className="rounded-xl border border-[#D1B18B]/60 bg-[#FFFDF8]/95 p-3 shadow-lg dark:border-[#729BA3]/40 dark:bg-[#0F1E2A]/95">
                          <p className="text-sm font-bold text-[#1B3A4B] dark:text-[#F7EFE7]">
                            {d.dimension}
                          </p>
                          <div className="mt-1.5 space-y-1 font-mono text-xs tabular-nums text-slate-700 dark:text-slate-300">
                            <p>
                              Rata-rata Positif:{' '}
                              <strong className="text-[#1B3A4B] dark:text-[#D1B18B]">
                                {d.mean.toFixed(2)}
                              </strong>{' '}
                              / 4.00
                            </p>
                            <p>
                              Sering Dilakukan:{' '}
                              <strong>
                                {d.dominantMode} ({SCALE_LABELS[d.dominantMode]})
                              </strong>
                            </p>
                            <p>
                              Jarang Dilakukan:{' '}
                              <strong>
                                {d.dominantLeast} ({SCALE_LABELS[d.dominantLeast]})
                              </strong>
                            </p>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar
                    dataKey="meanRounded"
                    radius={[8, 8, 2, 2]}
                    maxBarSize={48}
                    onClick={(data) => {
                      const payload = data?.payload as DimensionSummary | undefined;
                      if (payload?.dimension) {
                        const clicked = payload.dimension;
                        onSelectDimension(selectedDimension === clicked ? 'ALL' : clicked);
                      }
                    }}
                    className="cursor-pointer"
                  >
                    {dimChartData.map((entry) => {
                      const isSelected =
                        selectedDimension === 'ALL' || selectedDimension === entry.dimension;
                      return (
                        <Cell
                          key={entry.dimension}
                          fill={getDimBarColor(entry.mean)}
                          fillOpacity={isSelected ? 1 : 0.28}
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Per Kelas (Batang) */}
          <div className="lg:col-span-5 flex flex-col border-t border-[#1B3A4B]/10 pt-5 dark:border-[#729BA3]/25">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-[#1B3A4B] dark:text-[#F7EFE7]">
                  Grafik Batang per Kelas
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  9 rombongan belajar (X-1 s.d. XII-3)
                </p>
              </div>
              <div className="flex items-center gap-1 rounded-lg bg-[#F7EFE7] p-0.5 dark:bg-[#0F1E2A]">
                <button
                  type="button"
                  onClick={() => setClassSortMode('score')}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    classSortMode === 'score'
                      ? 'bg-[#1B3A4B] text-white dark:bg-[#D1B18B] dark:text-[#1B3A4B]'
                      : 'text-[#1B3A4B] hover:bg-white/70 dark:text-slate-300 dark:hover:bg-[#1B3A4B]'
                  }`}
                >
                  Peringkat
                </button>
                <button
                  type="button"
                  onClick={() => setClassSortMode('order')}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    classSortMode === 'order'
                      ? 'bg-[#1B3A4B] text-white dark:bg-[#D1B18B] dark:text-[#1B3A4B]'
                      : 'text-[#1B3A4B] hover:bg-white/70 dark:text-slate-300 dark:hover:bg-[#1B3A4B]'
                  }`}
                >
                  Urut Kelas
                </button>
              </div>
            </div>

            <div className="h-[310px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={classChartData}
                  layout="vertical"
                  margin={{ top: 4, right: 20, left: 4, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[2.4, 3.4]}
                    tick={{ fill: axisMuted, fontSize: 11, fontFamily: 'JetBrains Mono' }}
                    axisLine={{ stroke: gridStroke }}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="kelas"
                    width={48}
                    tick={{ fill: axisText, fontSize: 12, fontWeight: 600, fontFamily: 'JetBrains Mono' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: isDark ? 'rgba(209,177,139,0.1)' : 'rgba(114,155,163,0.14)' }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const c = payload[0].payload as ClassSummary;
                      return (
                        <div className="rounded-xl border border-[#D1B18B]/60 bg-[#FFFDF8]/95 p-3 shadow-lg dark:border-[#729BA3]/40 dark:bg-[#0F1E2A]/95">
                          <p className="text-sm font-bold text-[#1B3A4B] dark:text-[#F7EFE7]">
                            Kelas {c.kelas}
                          </p>
                          <div className="mt-1 space-y-0.5 font-mono text-xs tabular-nums text-slate-700 dark:text-slate-300">
                            <p>
                              Rata-rata:{' '}
                              <strong className="text-[#1B3A4B] dark:text-[#D1B18B]">
                                {c.mean.toFixed(2)}
                              </strong>
                            </p>
                            <p>
                              Jumlah Siswa: <strong>{c.studentCount}</strong>
                            </p>
                            <p>
                              Total Pengisian: <strong>{c.responseCount}</strong>
                            </p>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="meanRounded" radius={[0, 7, 7, 0]} maxBarSize={22}>
                    {classChartData.map((entry, idx) => (
                      <Cell
                        key={entry.kelas}
                        fill={
                          idx === 0 && classSortMode === 'score'
                            ? isDark
                              ? '#D1B18B'
                              : '#1B3A4B'
                            : entry.mean >= 3.05
                              ? isDark
                                ? '#729BA3'
                                : '#2E5A74'
                              : entry.mean >= 2.95
                                ? '#729BA3'
                                : '#8B5E3C'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Row 2: Per-Item Bar Chart */}
        <div className="mt-8 border-t border-[#1B3A4B]/10 pt-6 dark:border-[#729BA3]/25">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-bold text-[#1B3A4B] dark:text-[#F7EFE7]">
                Grafik Batang per Pernyataan ({filteredItemData.length} Item)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Bandingkan Rata-rata Positif (Dibalik) dengan Sering Dilakukan dan Jarang Dilakukan
              </p>
            </div>
            <div className="flex items-center gap-1 self-start rounded-xl bg-[#F7EFE7] p-1 dark:bg-[#0F1E2A] sm:self-auto">
              <button
                type="button"
                onClick={() => setItemMetricMode('meanRev')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  itemMetricMode === 'meanRev'
                    ? 'bg-[#1B3A4B] text-white dark:bg-[#D1B18B] dark:text-[#1B3A4B]'
                    : 'text-[#1B3A4B] hover:bg-white/70 dark:text-slate-300 dark:hover:bg-[#1B3A4B]'
                }`}
              >
                Rata-rata Positif
              </button>
              <button
                type="button"
                onClick={() => setItemMetricMode('compare')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  itemMetricMode === 'compare'
                    ? 'bg-[#1B3A4B] text-white dark:bg-[#D1B18B] dark:text-[#1B3A4B]'
                    : 'text-[#1B3A4B] hover:bg-white/70 dark:text-slate-300 dark:hover:bg-[#1B3A4B]'
                }`}
              >
                Rata-rata vs Sering vs Jarang
              </button>
            </div>
          </div>

          {/* Dimension Filter Bar */}
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => onSelectDimension('ALL')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedDimension === 'ALL'
                  ? 'bg-[#1B3A4B] text-white dark:bg-[#D1B18B] dark:text-[#1B3A4B]'
                  : 'bg-[#F7EFE7] text-[#1B3A4B] hover:bg-[#EFE2D3] dark:bg-[#0F1E2A] dark:text-slate-200 dark:hover:bg-[#1B3A4B]'
              }`}
            >
              Semua (21)
            </button>
            {DIMENSIONS.map((dim) => (
              <button
                key={dim}
                type="button"
                onClick={() => onSelectDimension(dim)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedDimension === dim
                    ? 'bg-[#2E5A74] text-white dark:bg-[#729BA3] dark:text-[#0F1E2A]'
                    : 'bg-[#F7EFE7] text-[#1B3A4B] hover:bg-[#EFE2D3] dark:bg-[#0F1E2A] dark:text-slate-200 dark:hover:bg-[#1B3A4B]'
                }`}
              >
                {dim}
              </button>
            ))}
          </div>

          <div
            className="mt-4 w-full"
            style={{ height: Math.max(240, filteredItemData.length * 34 + 50) }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredItemData}
                layout="vertical"
                margin={{ top: 6, right: 20, left: 8, bottom: 6 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, 4]}
                  ticks={[0, 1, 2, 3, 4]}
                  tick={{ fill: axisMuted, fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  axisLine={{ stroke: gridStroke }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="shortLabel"
                  width={210}
                  tick={{ fill: axisText, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: isDark ? 'rgba(209,177,139,0.1)' : 'rgba(114,155,163,0.14)' }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const item = payload[0].payload;
                    return (
                      <div className="max-w-xs rounded-xl border border-[#D1B18B]/60 bg-[#FFFDF8]/95 p-3 shadow-lg dark:border-[#729BA3]/40 dark:bg-[#0F1E2A]/95">
                        <p className="text-xs font-semibold text-[#8B5E3C] dark:text-[#D1B18B]">
                          {item.dim} {item.neg ? '· Pernyataan Negatif' : ''}
                        </p>
                        <p className="mt-0.5 text-sm font-bold text-[#1B3A4B] dark:text-[#F7EFE7]">
                          {item.fullLabel}
                        </p>
                        <div className="mt-2 space-y-1 font-mono text-xs tabular-nums text-slate-700 dark:text-slate-300">
                          <p>
                            Rata-rata Mentah: <strong>{item.meanRaw.toFixed(2)}</strong>
                          </p>
                          <p>
                            Rata-rata Positif:{' '}
                            <strong className="text-[#1B3A4B] dark:text-[#D1B18B]">
                              {item.meanRev.toFixed(2)}
                            </strong>
                          </p>
                          <p>
                            Sering Dilakukan:{' '}
                            <strong>
                              {item.mode} ({SCALE_LABELS[item.mode]})
                            </strong>
                          </p>
                          <p>
                            Jarang Dilakukan:{' '}
                            <strong>
                              {item.least} ({SCALE_LABELS[item.least]})
                            </strong>
                          </p>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="meanRev"
                  name="Rata-rata Positif"
                  fill={isDark ? '#729BA3' : '#1B3A4B'}
                  radius={[0, 6, 6, 0]}
                  maxBarSize={itemMetricMode === 'compare' ? 11 : 18}
                />
                {itemMetricMode === 'compare' && (
                  <>
                    <Bar
                      dataKey="mode"
                      name="Sering Dilakukan"
                      fill="#D1B18B"
                      radius={[0, 6, 6, 0]}
                      maxBarSize={11}
                    />
                    <Bar
                      dataKey="least"
                      name="Jarang Dilakukan"
                      fill="#8B5E3C"
                      radius={[0, 6, 6, 0]}
                      maxBarSize={11}
                    />
                  </>
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
          {itemMetricMode === 'compare' && (
            <div className="mt-3 flex flex-wrap items-center gap-5 text-xs text-slate-600 dark:text-slate-300">
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-xs bg-[#1B3A4B] dark:bg-[#729BA3]" />
                Rata-rata Positif (Dibalik)
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-xs bg-[#D1B18B]" />
                Sering Dilakukan (Modus)
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-xs bg-[#8B5E3C]" />
                Jarang Dilakukan (Paling Sedikit)
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
