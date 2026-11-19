import { DashboardMetrics } from '../utils/analytics';

interface InsightsConclusionSectionProps {
  metrics: DashboardMetrics;
}

export function InsightsConclusionSection({ metrics }: InsightsConclusionSectionProps) {
  const sixFindings = [
    {
      number: '01',
      title: 'Sudah Bagus',
      detail:
        'Siswa sudah menunjukkan sikap yang sangat baik dalam menghargai perbedaan pendapat dengan skor 3,44 (Modus 4), menyapa dan bersikap ramah dengan skor 3,38, menyempatkan diri berdoa dengan skor 3,29, serta datang tepat waktu ke sekolah dengan skor 3,21. Hal ini membuktikan bahwa nilai Bermasyarakat dan Beribadah menjadi kekuatan utama di sekolah ini.',
      accentClass: 'border-t-emerald-600 dark:border-t-emerald-400',
    },
    {
      number: '02',
      title: 'Negatif Rendah = Bagus',
      detail:
        'Pernyataan negatif justru menunjukkan hasil yang baik karena skor mentahnya rendah. Siswa jarang mengalami mimpi buruk setelah bermain HP larut malam (1,84 → dibalik 3,16), jarang menunda ibadah karena scrolling HP (1,91 → dibalik 3,09), dan jarang tertidur dengan HP di tangan (2,05 → dibalik 2,95).',
      accentClass: 'border-t-[#729BA3]',
    },
    {
      number: '03',
      title: 'Prioritas: Gemar Belajar',
      detail:
        'Dimensi Gemar Belajar masih perlu dibina karena skornya berada di angka 2,75. Indikator yang paling rendah adalah mengajukan pertanyaan berbobot dengan skor 2,45 (Modus 2). Banyak siswa yang masih merasa ragu untuk bertanya di kelas, sehingga budaya diskusi perlu terus didorong.',
      accentClass: 'border-t-[#D1B18B]',
    },
    {
      number: '04',
      title: 'Prioritas: Berolahraga',
      detail:
        'Dimensi Berolahraga memperoleh skor 2,79 dengan indikator terendah pada olahraga rutin di luar jam pelajaran sebesar 2,47 (Modus 2). Hal ini menunjukkan bahwa aktivitas gerak siswa di luar jam olahraga masih perlu ditingkatkan melalui program gerak aktif yang terjadwal.',
      accentClass: 'border-t-[#2E5A74] dark:border-t-sky-400',
    },
    {
      number: '05',
      title: 'Prioritas: Makan Sehat dan Bergizi',
      detail:
        'Dimensi Makan Sehat dan Bergizi memperoleh skor 2,83. Masih banyak siswa yang jajannya didominasi makanan kurang sehat (2,49 → dibalik 2,51) dan belum menghabiskan MBG tanpa sisa dengan skor 2,88. Edukasi kantin sehat dan pembiasaan menghabiskan MBG perlu diperkuat.',
      accentClass: 'border-t-amber-600 dark:border-t-amber-400',
    },
    {
      number: '06',
      title: 'Prioritas: Tidur Cepat',
      detail:
        'Dimensi Tidur Cepat memperoleh skor 2,84 pada indikator tidur cukup 7 sampai 8 jam. Masih ada siswa yang tidur larut karena bermain HP. Oleh sebab itu, perlu adanya kampanye "HP tidur duluan" pada pukul 21.00 yang melibatkan peran orang tua di rumah.',
      accentClass: 'border-t-[#8B5E3C] dark:border-t-[#D1B18B]',
    },
  ];

  const actionPlans = [
    {
      number: '01',
      title: 'Gemar Belajar',
      metric: 'Skor dimensi 2.75 · Pertanyaan berbobot 2.45',
      recommendation:
        'Wajibkan minimal satu pertanyaan berbobot per kelas setiap hari dan berikan apresiasi terbuka kepada siswa yang berani bertanya.',
      target: 'Target: skor pertanyaan berbobot naik dari 2,45 ke >= 3,00.',
    },
    {
      number: '02',
      title: 'Berolahraga',
      metric: 'Skor dimensi 2.79 · Olahraga rutin 2.47',
      recommendation:
        'Adakan senam atau jalan kaki bersama selama 15 menit sebelum jam pertama sebanyak tiga kali dalam seminggu.',
      target: 'Target: skor olahraga rutin naik dari 2,47 ke >= 3,00.',
    },
    {
      number: '03',
      title: 'Makan Sehat dan Bergizi',
      metric: 'Skor dimensi 2.83 · Habiskan MBG 2.88',
      recommendation:
        'Perkuat edukasi memilih air putih dibanding minuman manis di kantin serta biasakan menghabiskan porsi MBG tanpa sisa.',
      target: 'Target: skor pola makan sehat naik ke >= 3,00.',
    },
    {
      number: '04',
      title: 'Tidur Cepat',
      metric: 'Tidur cukup 7–8 jam 2.84',
      recommendation:
        'Ajak orang tua ikut mengontrol penggunaan HP pukul 21.00 agar siswa dapat tidur lebih cepat dan memenuhi istirahat 7–8 jam.',
      target: 'Target: skor tidur cukup naik dari 2,84 ke >= 3,10.',
    },
  ];

  return (
    <section id="kesimpulan" className="scroll-mt-24 space-y-6">
      {/* Main Data Conclusion Banner */}
      <div className="glass-dark rounded-3xl p-6 text-white sm:p-8">
        <p className="text-xs font-semibold text-[#D1B18B]">
          Kesimpulan Hasil Data · {metrics.totalResponses} Pengisian · {metrics.totalStudents} Siswa Unik
        </p>
        <h2
          style={{ fontFamily: 'var(--font-display)' }}
          className="mt-1.5 text-xl font-bold tracking-tight text-white sm:text-2xl"
        >
          Kesimpulan Survei 7 Kebiasaan Anak Indonesia Hebat
        </h2>
        <p className="mt-3 max-w-4xl text-justify text-sm leading-relaxed text-[#F7EFE7]/95 sm:text-base">
          Hasil survei dari <strong className="font-mono">{metrics.totalResponses}</strong>{' '}
          pengisian dan <strong className="font-mono">{metrics.totalStudents}</strong> siswa
          menunjukkan bahwa kebiasaan siswa SMA PGRI 2 Banjarmasin secara umum berada pada
          kategori{' '}
          <strong className="font-mono text-[#D1B18B]">
            {metrics.overallCategory.toUpperCase()} ({metrics.overallMean.toFixed(2)} / 4.00)
          </strong>
          . Kekuatan utama terletak pada dimensi Bermasyarakat (3,25), Beribadah (3,16), dan
          Bangun Pagi (3,04), sedangkan dimensi yang menjadi prioritas pembinaan adalah Gemar
          Belajar (2,75), Berolahraga (2,79), Makan Sehat dan Bergizi (2,83), serta Tidur
          Cepat (2,84).
        </p>

        {/* 6 Finding Cards */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sixFindings.map((item) => (
            <div
              key={item.number}
              className={`rounded-2xl border border-white/15 border-t-4 bg-[#FFFDF8] p-4 text-[#1B3A4B] shadow-sm dark:bg-[#102332] dark:text-[#F7EFE7] ${item.accentClass}`}
            >
              <p className="font-mono text-xs font-bold text-[#8B5E3C] dark:text-[#D1B18B]">
                {item.number}. {item.title}
              </p>
              <p className="mt-2 text-justify text-xs leading-relaxed text-slate-700 dark:text-slate-300 sm:text-sm">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 4 Actionable Recommendations */}
      <div className="glass-surface rounded-3xl p-6 sm:p-8">
        <div>
          <p className="text-xs font-semibold text-[#8B5E3C] dark:text-[#D1B18B]">
            Rencana Tindak Lanjut · SMA PGRI 2 Banjarmasin
          </p>
          <h2
            style={{ fontFamily: 'var(--font-display)' }}
            className="mt-1 text-xl font-bold tracking-tight text-[#1B3A4B] dark:text-[#F7EFE7] sm:text-2xl"
          >
            Insight &amp; Rekomendasi Tindakan Prioritas
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Empat program pembinaan terukur berdasarkan hasil survei 7 Kebiasaan Anak
            Indonesia Hebat.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {actionPlans.map((plan) => (
            <article
              key={plan.number}
              className="flex flex-col justify-between rounded-2xl border border-[#D1B18B]/50 bg-[#FFFDF8] p-5 dark:border-[#729BA3]/30 dark:bg-[#102332]"
            >
              <div>
                <p className="font-mono text-xs font-bold text-[#8B5E3C] dark:text-[#D1B18B]">
                  {plan.number}. Program Prioritas
                </p>
                <h3 className="mt-1.5 text-base font-bold text-[#1B3A4B] dark:text-[#F7EFE7]">
                  {plan.title}
                </h3>
                <p className="mt-1 font-mono text-xs tabular-nums text-[#2E5A74] dark:text-[#729BA3]">
                  {plan.metric}
                </p>
                <p className="mt-3 text-justify text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {plan.recommendation}
                </p>
              </div>
              <p className="mt-4 border-t border-[#E8DDD0] pt-3 text-xs font-semibold text-[#1B3A4B] dark:border-[#2E5A74]/50 dark:text-[#D1B18B]">
                {plan.target}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
