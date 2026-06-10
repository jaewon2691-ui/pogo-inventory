import Tesseract from 'tesseract.js'
import type { OcrExtraction } from '../types'

/**
 * A small dictionary of names used to "snap" OCR output to a real Pokémon.
 * Expand freely — or replace with the full species list later.
 */
const KNOWN_NAMES = [
  'Houndour', 'Houndoom', 'Gyarados', 'Magikarp', 'Dialga', 'Dragonite',
  'Dragonair', 'Dratini', 'Gastly', 'Haunter', 'Gengar', 'Tapu Fini',
  'Mewtwo', 'Mew', 'Rayquaza', 'Garchomp', 'Tyranitar', 'Metagross',
  'Machamp', 'Snorlax', 'Lucario', 'Charizard', 'Blastoise', 'Venusaur',
  'Pikachu', 'Eevee', 'Espeon', 'Umbreon', 'Slaking', 'Kyogre', 'Groudon',
]

/** Appraisal phrases that the in-game leaders say (English client). */
const APPRAISAL_PHRASES = [
  'best buddy', 'amazes me', 'wonder', 'battle with the best',
  'strong', 'decent', 'remarkable', 'stats', 'appraise',
]

function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      )
    }
  }
  return dp[m][n]
}

/** Fuzzy-match a token against known names; returns the best name or undefined. */
function matchName(token: string): string | undefined {
  const t = token.toLowerCase()
  let best: { name: string; dist: number } | undefined
  for (const name of KNOWN_NAMES) {
    const dist = levenshtein(t, name.toLowerCase())
    const tolerance = name.length <= 5 ? 1 : 2
    if (dist <= tolerance && (!best || dist < best.dist)) {
      best = { name, dist }
    }
  }
  return best?.name
}

export interface OcrProgress {
  status: string
  progress: number // 0..1
}

/**
 * Run Tesseract.js on the uploaded screenshot and apply Pokémon-GO-specific
 * parsing heuristics. Everything stays client-side: the image never leaves
 * the browser.
 */
export async function extractFromScreenshot(
  file: File,
  onProgress?: (p: OcrProgress) => void,
): Promise<OcrExtraction> {
  const result = await Tesseract.recognize(file, 'eng', {
    logger: (m) => {
      if (onProgress && typeof m.progress === 'number') {
        onProgress({ status: m.status, progress: m.progress })
      }
    },
  })

  const rawText = result.data.text ?? ''
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  const extraction: OcrExtraction = {
    appraisalLines: [],
    possibleIvs: [],
    confidence: Math.max(0, Math.min(1, (result.data.confidence ?? 0) / 100)),
    rawText,
  }

  // --- CP: the appraisal screen shows "CP 2380" (sometimes OCR'd as "cp2380")
  const cpMatch = rawText.match(/[CcGg][Pp]\s*[.:]?\s*(\d{2,4})/)
  if (cpMatch) {
    const cp = parseInt(cpMatch[1], 10)
    if (cp >= 10 && cp <= 9999) extraction.cp = cp
  }

  // --- Name: fuzzy-match each token (and 2-token windows for "Tapu Fini")
  outer: for (const line of lines) {
    const tokens = line.split(/\s+/).filter((t) => /^[A-Za-z'-]{3,}$/.test(t))
    for (let i = 0; i < tokens.length; i++) {
      const single = matchName(tokens[i])
      if (single) {
        extraction.name = single
        break outer
      }
      if (i + 1 < tokens.length) {
        const pair = matchName(`${tokens[i]} ${tokens[i + 1]}`)
        if (pair) {
          extraction.name = pair
          break outer
        }
      }
    }
  }

  // --- Appraisal text lines
  for (const line of lines) {
    const lower = line.toLowerCase()
    if (APPRAISAL_PHRASES.some((p) => lower.includes(p))) {
      extraction.appraisalLines.push(line)
    }
  }

  // --- Possible IV numbers (0–15) that appear as standalone tokens.
  // The appraisal screen itself shows bars rather than numbers, but players
  // often screenshot IV-checker overlays — pick those up when present.
  const numberTokens = rawText.match(/\b(\d{1,2})\b/g) ?? []
  for (const tok of numberTokens) {
    const n = parseInt(tok, 10)
    if (n >= 0 && n <= 15) extraction.possibleIvs.push(n)
  }
  extraction.possibleIvs = extraction.possibleIvs.slice(0, 6)

  return extraction
}
