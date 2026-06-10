import type {
  ActionId,
  EvaluationResult,
  PokemonData,
  ScoreReason,
  Verdict,
} from '../types'

/**
 * Scoring weights — tweak these in one place to rebalance the whole app.
 * Total possible is intentionally allowed to exceed 100; we clamp at the end.
 */
const WEIGHTS = {
  ivMax: 40, // points at 100% IV
  shiny: 15,
  shadow: 10,
  legendary: 15,
  mega: 8,
  size: 5,
  legacyMove: 10,
  purified: 3,
  purposeFit: 7,
}

/** Hard floors that encode the "almost always keep" rules. */
const FLOORS = {
  perfectIv: 80, // 4-star
  shadowLegendary: 88,
  shinyMin: 45, // shiny never lands in plain Transfer
  legendaryMin: 45, // legendary never lands in plain Transfer
}

const THRESHOLDS: { verdict: Verdict; min: number }[] = [
  { verdict: 'keep', min: 75 },
  { verdict: 'maybe', min: 45 },
  { verdict: 'transfer', min: 0 },
]

export function ivPercent(p: PokemonData): number {
  return Math.round(((p.attackIv + p.defenseIv + p.hpIv) / 45) * 100)
}

export function isPerfect(p: PokemonData): boolean {
  return p.attackIv === 15 && p.defenseIv === 15 && p.hpIv === 15
}

export function evaluate(p: PokemonData): EvaluationResult {
  const reasons: ScoreReason[] = []
  const actions = new Set<ActionId>()
  const iv = ivPercent(p)

  // --- IV contribution -------------------------------------------------
  const ivPoints = Math.round((iv / 100) * WEIGHTS.ivMax)
  let score = ivPoints
  if (isPerfect(p)) {
    reasons.push({ key: 'reason.perfectIv', points: ivPoints })
  } else if (iv >= 80) {
    reasons.push({ key: 'reason.highIv', points: ivPoints })
  } else if (iv >= 50) {
    reasons.push({ key: 'reason.midIv', points: ivPoints })
  } else {
    reasons.push({ key: 'reason.lowIv', points: ivPoints })
  }

  // --- Trait bonuses ----------------------------------------------------
  if (p.shiny) {
    score += WEIGHTS.shiny
    reasons.push({ key: 'reason.shiny', points: WEIGHTS.shiny })
    actions.add('keepForTrade')
  }
  if (p.shadow && p.legendary) {
    score += WEIGHTS.shadow + WEIGHTS.legendary
    reasons.push({
      key: 'reason.shadowLegendary',
      points: WEIGHTS.shadow + WEIGHTS.legendary,
    })
  } else {
    if (p.shadow) {
      score += WEIGHTS.shadow
      reasons.push({ key: 'reason.shadow', points: WEIGHTS.shadow })
    }
    if (p.legendary) {
      score += WEIGHTS.legendary
      reasons.push({ key: 'reason.legendary', points: WEIGHTS.legendary })
    }
  }
  if (p.canMega) {
    score += WEIGHTS.mega
    reasons.push({ key: 'reason.mega', points: WEIGHTS.mega })
    actions.add('megaLater')
  }
  if (p.xxlOrXxs) {
    score += WEIGHTS.size
    reasons.push({ key: 'reason.size', points: WEIGHTS.size })
  }
  if (p.legacyMove) {
    score += WEIGHTS.legacyMove
    reasons.push({ key: 'reason.legacy', points: WEIGHTS.legacyMove })
  }
  if (p.purified) {
    score += WEIGHTS.purified
    reasons.push({ key: 'reason.purified', points: WEIGHTS.purified })
  }

  // --- Purpose ----------------------------------------------------------
  switch (p.purpose) {
    case 'raid':
      if (iv >= 80 || p.shadow || p.legendary) {
        score += WEIGHTS.purposeFit
        reasons.push({ key: 'reason.purposeRaid', points: WEIGHTS.purposeFit })
        actions.add('powerUp')
        if (!p.legendary) actions.add('evolve')
        actions.add('secondMove')
      }
      break
    case 'pvp':
      // Perfect IVs are NOT always best for PvP leagues — flag for a rank check.
      reasons.push({ key: 'reason.purposePvp' })
      actions.add('pvpCheck')
      score += 4
      break
    case 'gym':
      score += 3
      reasons.push({ key: 'reason.purposeGym', points: 3 })
      break
    case 'collection':
      score += 4
      reasons.push({ key: 'reason.purposeCollection', points: 4 })
      break
    case 'unsure':
      break
  }

  // --- Hard rules / floors ------------------------------------------------
  if (isPerfect(p)) score = Math.max(score, FLOORS.perfectIv)
  if (p.shadow && p.legendary) score = Math.max(score, FLOORS.shadowLegendary)
  if (p.shiny) score = Math.max(score, FLOORS.shinyMin)
  if (p.legendary) score = Math.max(score, FLOORS.legendaryMin)

  score = Math.max(0, Math.min(100, Math.round(score)))

  // --- Verdict ------------------------------------------------------------
  const verdict =
    THRESHOLDS.find((t) => score >= t.min)?.verdict ?? 'transfer'

  // --- Verdict-driven actions ----------------------------------------------
  if (verdict === 'keep') {
    if (iv >= 80 && !actions.has('pvpCheck')) actions.add('powerUp')
  }
  if (verdict === 'transfer') {
    const plain =
      !p.shiny && !p.shadow && !p.legendary && !p.canMega && !p.legacyMove
    if (plain) {
      reasons.push({ key: 'reason.noSpecial' })
      actions.add('transferSafely')
    }
  }
  if (verdict === 'maybe' && p.shiny) actions.add('keepForTrade')

  return {
    verdict,
    score,
    ivPercent: iv,
    reasons,
    actions: [...actions],
    explanationKey: `explain.${verdict}`,
  }
}
