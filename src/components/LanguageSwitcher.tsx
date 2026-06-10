import type { Lang } from '../i18n'

interface Props {
  lang: Lang
  onChange: (lang: Lang) => void
}

const LABELS: { id: Lang; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'ko', label: '한국어' },
]

export default function LanguageSwitcher({ lang, onChange }: Props) {
  return (
    <div className="flex rounded-full bg-slate-800/60 p-1" role="group" aria-label="Language">
      {LABELS.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
            lang === id
              ? 'bg-white text-slate-900'
              : 'text-slate-300 hover:text-white'
          }`}
          aria-pressed={lang === id}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
