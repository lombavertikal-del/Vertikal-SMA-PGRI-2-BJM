import { useState } from 'react';
import { MessageSquare, Trash2 } from 'lucide-react';
import { FeedbackEntry } from './StudentDirectorySection';

interface SavedFeedbackSectionProps {
  feedbacks: FeedbackEntry[];
  onDeleteFeedback: (id: string) => void;
  onClearAllFeedbacks: () => void;
}

export function SavedFeedbackSection({
  feedbacks,
  onDeleteFeedback,
  onClearAllFeedbacks,
}: SavedFeedbackSectionProps) {
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <section id="feedback" className="scroll-mt-24">
      <div className="glass-surface rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold text-[#8B5E3C] dark:text-[#D1B18B]">
              Arsip Pembinaan Siswa · Tersimpan Lokal di Perangkat
            </p>
            <h2
              style={{ fontFamily: 'var(--font-display)' }}
              className="mt-1 text-xl font-bold tracking-tight text-[#1B3A4B] dark:text-[#F7EFE7] sm:text-2xl"
            >
              Semua Feedback Tersimpan ({feedbacks.length})
            </h2>
          </div>

          {feedbacks.length > 0 && !confirmClear && (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="inline-flex items-center gap-1.5 self-start rounded-xl bg-[#8B5E3C] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#734C2F] cursor-pointer whitespace-nowrap sm:self-auto"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Hapus Semua Feedback
            </button>
          )}

          {confirmClear && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs dark:border-rose-800 dark:bg-rose-950/60">
              <span className="font-semibold text-rose-800 dark:text-rose-200">
                Yakin hapus semua?
              </span>
              <button
                type="button"
                onClick={() => {
                  onClearAllFeedbacks();
                  setConfirmClear(false);
                }}
                className="rounded-lg bg-rose-700 px-2.5 py-1 font-bold text-white hover:bg-rose-800 cursor-pointer"
              >
                Ya, Hapus
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="rounded-lg px-2 py-1 font-semibold text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-[#1B3A4B] cursor-pointer"
              >
                Batal
              </button>
            </div>
          )}
        </div>

        {feedbacks.length === 0 ? (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[#E8DDD0] bg-[#FFFDF8] p-5 text-sm text-slate-600 dark:border-[#2E5A74]/50 dark:bg-[#102332] dark:text-slate-300">
            <MessageSquare className="h-5 w-5 shrink-0 text-[#8B5E3C] dark:text-[#D1B18B]" aria-hidden="true" />
            <p>
              Belum ada feedback pembinaan tersimpan. Pilih salah satu siswa pada tabel{' '}
              <a
                href="#siswa"
                className="font-semibold text-[#1B3A4B] underline underline-offset-4 dark:text-[#D1B18B]"
              >
                Data Siswa
              </a>{' '}
              di atas untuk menambahkan saran pembinaan.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {feedbacks.map((fb) => (
              <div
                key={fb.id}
                className="flex items-start justify-between gap-3 rounded-2xl border border-[#E8DDD0] bg-[#FFFDF8] p-4 dark:border-[#2E5A74]/50 dark:bg-[#102332]"
              >
                <div className="min-w-0 text-xs">
                  <p className="font-bold text-[#1B3A4B] dark:text-[#F7EFE7]">
                    {fb.studentName}{' '}
                    <span className="font-mono font-semibold text-[#8B5E3C] dark:text-[#D1B18B]">
                      ({fb.studentCode})
                    </span>
                  </p>
                  <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                    {fb.kategori} · {fb.oleh} · <span className="font-mono">{fb.tgl}</span>
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                    {fb.isi}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteFeedback(fb.id)}
                  aria-label="Hapus feedback"
                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 cursor-pointer shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
