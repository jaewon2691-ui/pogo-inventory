export type Purpose = 'raid' | 'pvp' | 'gym' | 'collection' | 'unsure'

export type Verdict = 'keep' | 'maybe' | 'transfer'

export type ActionId =
  | 'powerUp'
  | 'evolve'
  | 'megaLater'
  | 'secondMove'
  | 'keepForTrade'
  | 'transferSafely'
  | 'pvpCheck'

export interface PokemonData {
  name: string
  cp: number | ''
  attackIv: number
  defenseIv: number
  hpIv: number
  shiny: boolean
  shadow: boolean
  purified: boolean
  legendary: boolean
  canMega: boolean
  xxlOrXxs: boolean
  legacyMove: boolean
  purpose: Purpose
}

export interface ScoreReason {
  /** i18n key under results.reasons */
  key: string
  /** points contributed (can be negative); undefined for informational reasons */
  points?: number
}

export interface EvaluationResult {
  verdict: Verdict
  score: number
  ivPercent: number
  reasons: ScoreReason[]
  actions: ActionId[]
  /** i18n key under results.explanations */
  explanationKey: string
}

export interface OcrExtraction {
  name?: string
  cp?: number
  /** raw appraisal-ish text lines we recognized */
  appraisalLines: string[]
  /** any 0-15 numbers spotted that might be IVs */
  possibleIvs: number[]
  /** 0..1 — how much we trust the extraction */
  confidence: number
  rawText: string
}

export const emptyPokemon: PokemonData = {
  name: '',
  cp: '',
  attackIv: 0,
  defenseIv: 0,
  hpIv: 0,
  shiny: false,
  shadow: false,
  purified: false,
  legendary: false,
  canMega: false,
  xxlOrXxs: false,
  legacyMove: false,
  purpose: 'unsure',
}
