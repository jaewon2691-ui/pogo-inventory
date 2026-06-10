import type { Lang } from '../i18n'
import { translate } from '../i18n'
import type { PokemonData, Purpose } from '../types'
import { presets } from '../data/presets'

interface Props {
  lang: Lang
  data: PokemonData
  onChange: (data: PokemonData) => void
  onEvaluate: () => void
}

const PURPOSES: Purpose[] = ['raid', 'pvp', 'gym', 'collection', 'unsure']

function IvSlider({
  label,
  value,
  color,
  onChange,
}: {
  label: string
  value: number
  color: string
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <span className="font-mono text-sm font-bold text-slate-900">{value}/15</span>
      </div>
      {/* Signature element: in-game-style 15-segment bar, tappable */}
      <div className="mt-1.5 flex gap-[3px]" role="presentation">
        {Array.from({ length: 15 }, (_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`${label} ${i + 1}`}
            onClick={() => onChange(value === i + 1 ? i : i + 1)}
            className={`h-5 flex-1 rounded-sm transition-colors ${
              i < value ? (value === 15 ? 'bg-rose-500' : color) : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
      <input
        type="range"
        min={0}
        max={15}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="mt-1 w-full accent-teal-600"
        aria-label={label}
      />
    </div>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={`flex min-h-[48px] items-center justify-between rounded-xl px-4 py-2.5 text-left text-sm font-medium ring-1 transition-colors ${
        checked
          ? 'bg-teal-50 text-teal-900 ring-teal-300'
          : 'bg-white text-slate-600 ring-slate-200 hover:ring-slate-300'
      }`}
    >
      <span>{label}</span>
      <span
        className={`ml-3 flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors ${
          checked ? 'bg-teal-550' : 'bg-slate-300'
        }`}
        aria-hidden
      >
        <span
          className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </span>
    </button>
  )
}

export default function PokemonForm({ lang, data, onChange, onEvaluate }: Props) {
  const t = (k: string) => translate(lang, k)
  const set = <K extends keyof PokemonData>(key: K, value: PokemonData[K]) =>
    onChange({ ...data, [key]: value })

  const ivTotal = data.attackIv + data.defenseIv + data.hpIv

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="font-display text-lg font-bold text-slate-900">{t('form.title')}</h2>

      {/* Presets */}
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {t('form.presets')}
      </p>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange({ ...p.data })}
            className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Name + CP */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="text-sm font-medium text-slate-700">
            {t('form.name')}
          </label>
          <input
            id="name"
            type="text"
            value={data.name}
            placeholder={t('form.namePlaceholder')}
            onChange={(e) => set('name', e.target.value)}
            className="mt-1.5 w-full rounded-xl border-0 bg-slate-50 px-4 py-3 text-base text-slate-900 ring-1 ring-slate-200 focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label htmlFor="cp" className="text-sm font-medium text-slate-700">
            {t('form.cp')}
          </label>
          <input
            id="cp"
            type="number"
            inputMode="numeric"
            min={10}
            max={9999}
            value={data.cp}
            placeholder={t('form.cpPlaceholder')}
            onChange={(e) =>
              set('cp', e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10) || 0))
            }
            className="mt-1.5 w-full rounded-xl border-0 bg-slate-50 px-4 py-3 text-base text-slate-900 ring-1 ring-slate-200 focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* IVs */}
      <div className="mt-5 space-y-4 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
        <IvSlider
          label={t('form.attack')}
          value={data.attackIv}
          color="bg-orange-400"
          onChange={(v) => set('attackIv', v)}
        />
        <IvSlider
          label={t('form.defense')}
          value={data.defenseIv}
          color="bg-orange-400"
          onChange={(v) => set('defenseIv', v)}
        />
        <IvSlider
          label={t('form.hp')}
          value={data.hpIv}
          color="bg-orange-400"
          onChange={(v) => set('hpIv', v)}
        />
        <p className="text-right text-xs font-semibold text-slate-500">
          {t('form.ivTotal')}: {ivTotal}/45 ({Math.round((ivTotal / 45) * 100)}%)
        </p>
      </div>

      {/* Trait toggles */}
      <p className="mt-5 text-sm font-medium text-slate-700">{t('form.flags')}</p>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Toggle label={t('form.shiny')} checked={data.shiny} onChange={(v) => set('shiny', v)} />
        <Toggle label={t('form.shadow')} checked={data.shadow} onChange={(v) => set('shadow', v)} />
        <Toggle label={t('form.purified')} checked={data.purified} onChange={(v) => set('purified', v)} />
        <Toggle label={t('form.legendary')} checked={data.legendary} onChange={(v) => set('legendary', v)} />
        <Toggle label={t('form.canMega')} checked={data.canMega} onChange={(v) => set('canMega', v)} />
        <Toggle label={t('form.xxlxxs')} checked={data.xxlOrXxs} onChange={(v) => set('xxlOrXxs', v)} />
        <Toggle label={t('form.legacyMove')} checked={data.legacyMove} onChange={(v) => set('legacyMove', v)} />
      </div>

      {/* Purpose */}
      <p className="mt-5 text-sm font-medium text-slate-700">{t('form.purpose')}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {PURPOSES.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => set('purpose', p)}
            aria-pressed={data.purpose === p}
            className={`min-h-[44px] rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              data.purpose === p
                ? 'bg-ink text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-slate-300'
            }`}
          >
            {t(`form.purpose.${p}`)}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onEvaluate}
        className="mt-6 min-h-[56px] w-full rounded-2xl bg-teal-550 text-lg font-bold text-white shadow-lg shadow-teal-600/20 transition-transform active:scale-[0.98]"
      >
        {t('form.evaluate')}
      </button>
    </section>
  )
}
