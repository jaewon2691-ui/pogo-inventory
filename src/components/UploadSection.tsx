import { useRef, useState } from 'react'
import type { Lang } from '../i18n'
import { translate } from '../i18n'
import type { OcrExtraction } from '../types'
import { extractFromScreenshot } from '../ocr/ocr'
import { detectIvBarsFromImage } from '../ocr/ivBarDetection'

interface Props {
  lang: Lang
  onExtracted: (extraction: OcrExtraction) => void
}

type Status = 'idle' | 'running' | 'done' | 'error'

export default function UploadSection({ lang, onExtracted }: Props) {
  const t = (k: string) => translate(lang, k)
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [progress, setProgress] = useState(0)
  const [extraction, setExtraction] = useState<OcrExtraction | null>(null)

  async function handleFile(file: File) {
    if (preview) URL.revokeObjectURL(preview)
    setPreview(URL.createObjectURL(file))
    setStatus('running')
    setProgress(0)
    setExtraction(null)
    try {
      // Future: IV-bar detection runs alongside OCR. Today it returns null
      // and the app falls back to OCR + manual correction.
      const [ocr, bars] = await Promise.all([
        extractFromScreenshot(file, (p) => {
          if (p.status === 'recognizing text') setProgress(p.progress)
        }),
        detectIvBarsFromImage(file),
      ])
      if (bars && bars.confidence > 0.7) {
        // When implemented, bar-detected IVs take priority over OCR numbers.
        ocr.possibleIvs = [bars.attackIv, bars.defenseIv, bars.hpIv]
      }
      setExtraction(ocr)
      setStatus('done')
      onExtracted(ocr)
    } catch {
      setStatus('error')
    }
  }

  const found =
    extraction && (extraction.name || extraction.cp || extraction.appraisalLines.length > 0)

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="font-display text-lg font-bold text-slate-900">{t('upload.title')}</h2>
      <p className="mt-1 text-sm text-slate-500">{t('upload.hint')}</p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleFile(file)
        }}
      />

      {preview ? (
        <div className="mt-4 flex gap-4">
          <img
            src={preview}
            alt="Uploaded screenshot preview"
            className="h-44 w-auto max-w-[45%] rounded-xl object-cover ring-1 ring-slate-200"
          />
          <div className="flex flex-1 flex-col justify-center gap-2">
            {status === 'running' && (
              <>
                <p className="text-sm font-medium text-slate-700">{t('upload.running')}</p>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-teal-550 transition-all"
                    style={{ width: `${Math.round(progress * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400">
                  {t('upload.progress')}: {Math.round(progress * 100)}%
                </p>
              </>
            )}
            {status === 'done' && (
              <>
                <p className="text-sm font-semibold text-teal-700">{t('upload.done')}</p>
                {extraction && (
                  <p className="text-xs text-slate-500">
                    {found
                      ? `${t('upload.detected')}: ${[
                          extraction.name,
                          extraction.cp ? `CP ${extraction.cp}` : null,
                        ]
                          .filter(Boolean)
                          .join(' · ')}`
                      : t('upload.nothing')}
                  </p>
                )}
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 ring-1 ring-amber-200">
                  ⚠️ {t('upload.warning')}
                </p>
                {extraction && extraction.confidence < 0.6 && (
                  <p className="text-xs font-medium text-rose-600">
                    {t('upload.lowConfidence')}
                  </p>
                )}
              </>
            )}
            {status === 'error' && (
              <p className="text-sm font-medium text-rose-600">{t('upload.failed')}</p>
            )}
            <button
              onClick={() => inputRef.current?.click()}
              className="mt-1 w-fit rounded-lg px-3 py-1.5 text-sm font-semibold text-teal-700 ring-1 ring-teal-200 hover:bg-teal-50"
            >
              {t('upload.change')}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="mt-4 flex min-h-[120px] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 py-6 text-slate-500 transition-colors hover:border-teal-400 hover:bg-teal-50/50"
        >
          <span className="text-3xl" aria-hidden>📷</span>
          <span className="text-base font-semibold text-slate-700">{t('upload.button')}</span>
        </button>
      )}
    </section>
  )
}
