import { useEffect, useRef, useState } from 'react'
import type { Lang } from './i18n'
import { translate } from './i18n'
import type { EvaluationResult, OcrExtraction, PokemonData } from './types'
import { emptyPokemon } from './types'
import { evaluate } from './logic/scoring'
import LanguageSwitcher from './components/LanguageSwitcher'
import UploadSection from './components/UploadSection'
import PokemonForm from './components/PokemonForm'
import ResultCard from './components/ResultCard'

export default function App() {
  const [lang, setLang] = useState<Lang>('en')
  const [data, setData] = useState<PokemonData>({ ...emptyPokemon })
  const [result, setResult] = useState<EvaluationResult | null>(null)
  const resultRef = useRef<HTMLDivElement>(null)
  const t = (k: string) => translate(lang, k)

  function applyExtraction(extraction: OcrExtraction) {
    setData((prev) => {
      const next = { ...prev }
      if (extraction.name) next.name = extraction.name
      if (extraction.cp) next.cp = extraction.cp
      // Only trust IV numbers if we got exactly three (an IV-checker overlay).
      if (extraction.possibleIvs.length === 3) {
        const [a, d, h] = extraction.possibleIvs
        next.attackIv = a
        next.defenseIv = d
        next.hpIv = h
      }
      return next
    })
    setResult(null)
  }

  function handleEvaluate() {
    setResult(evaluate(data))
  }

  useEffect(() => {
    if (result) resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [result])

  return (
    <div className="min-h-screen bg-glacier">
      {/* Header */}
      <header className="bg-ink px-4 pb-6 pt-5">
        <div className="mx-auto flex max-w-xl items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-black tracking-tight text-white">
              {t('app.title')}
            </h1>
            <p className="mt-1 text-sm text-slate-300">{t('app.subtitle')}</p>
          </div>
          <LanguageSwitcher lang={lang} onChange={setLang} />
        </div>
      </header>

      {/* Body */}
      <main className="mx-auto max-w-xl space-y-4 px-4 py-5 pb-16">
        <UploadSection lang={lang} onExtracted={applyExtraction} />
        <PokemonForm lang={lang} data={data} onChange={(d) => { setData(d); setResult(null) }} onEvaluate={handleEvaluate} />
        {result && (
          <div ref={resultRef} className="scroll-mt-4">
            <ResultCard lang={lang} data={data} result={result} />
          </div>
        )}
        <p className="px-2 text-center text-xs text-slate-400">{t('footer.note')}</p>
      </main>
    </div>
  )
}
