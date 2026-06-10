import type { Lang } from '../i18n'
import { translate } from '../i18n'
import type { EvaluationResult, PokemonData } from '../types'

interface Props {
  lang: Lang
  data: PokemonData
  result: EvaluationResult
}

const VERDICT_STYLES = {
  keep: { ring: 'ring-emerald-300', bg: 'bg-emerald-50', pill: 'bg-emerald-600', bar: 'bg-emerald-500' },
  maybe: { ring: 'ring-amber-300', bg: 'bg-amber-50', pill: 'bg-amber-500', bar: 'bg-amber-400' },
  transfer: { ring: 'ring-rose-300', bg: 'bg-rose-50', pill: 'bg-rose-600', bar: 'bg-rose-500' },
} as const

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${className}`}>{label}</span>
  )
}

export default function ResultCard({ lang, data, result }: Props) {
  const t = (k: string) => translate(lang, k)
  const s = VERDICT_STYLES[result.verdict]

  return (
    <section className={`rounded-2xl p-5 shadow-sm ring-2 ${s.bg} ${s.ring}`} aria-live="polite">
      <h2 className="font-display text-lg font-bold text-slate-900">{t('result.title')}</h2>

      {/* Badges */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {data.shiny && <Badge label={`✨ ${t('badge.shiny')}`} className="bg-yellow-100 text-yellow-800" />}
        {data.shadow && <Badge label={`👿 ${t('badge.shadow')}`} className="bg-purple-100 text-purple-800" />}
        {data.purified && <Badge label={`💧 ${t('badge.purified')}`} className="bg-sky-100 text-sky-800" />}
        {data.legendary && <Badge label={`⭐ ${t('badge.legendary')}`} className="bg-indigo-100 text-indigo-800" />}
        {data.canMega && <Badge label={`🧬 ${t('badge.mega')}`} className="bg-pink-100 text-pink-800" />}
        {data.legacyMove && <Badge label={`📜 ${t('badge.legacy')}`} className="bg-orange-100 text-orange-800" />}
        {data.xxlOrXxs && <Badge label={`📏 ${t('badge.size')}`} className="bg-slate-200 text-slate-700" />}
      </div>

      {/* Verdict + score */}
      <div className="mt-4 flex items-center gap-4">
        <span className={`rounded-2xl px-5 py-3 text-xl font-black text-white ${s.pill}`}>
          {t(`result.verdict.${result.verdict}`)}
        </span>
        <div className="flex-1">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium text-slate-600">
              {t('result.score')} · IV {result.ivPercent}%
            </span>
            <span className="font-mono text-2xl font-black text-slate-900">{result.score}</span>
          </div>
          <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-500 ${s.bar}`}
              style={{ width: `${result.score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Reasons */}
      <p className="mt-5 text-sm font-semibold text-slate-800">{t('result.reasons')}</p>
      <ul className="mt-1.5 space-y-1">
        {result.reasons.map((r, i) => (
          <li key={i} className="flex items-baseline justify-between gap-3 text-sm text-slate-700">
            <span>• {t(r.key)}</span>
            {typeof r.points === 'number' && (
              <span className={`font-mono text-xs font-bold ${r.points >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                {r.points >= 0 ? `+${r.points}` : r.points}
              </span>
            )}
          </li>
        ))}
      </ul>

      {/* Actions */}
      {result.actions.length > 0 && (
        <>
          <p className="mt-5 text-sm font-semibold text-slate-800">{t('result.actions')}</p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {result.actions.map((a) => (
              <span
                key={a}
                className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-800 ring-1 ring-slate-300"
              >
                {t(`action.${a}`)}
              </span>
            ))}
          </div>
        </>
      )}

      {/* Beginner explanation */}
      <div className="mt-5 rounded-xl bg-white/80 p-4 ring-1 ring-slate-200">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
          {t('result.beginner')}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-slate-700">{t(result.explanationKey)}</p>
      </div>
    </section>
  )
}
