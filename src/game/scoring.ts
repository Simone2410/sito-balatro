import { HAND_TABLE } from './constants'
import { cardValue } from './deck'
import { evaluateHand } from './hands'
import { JOKERS } from './jokers'
import type { Card, JokerId, ScoreResult, ScoreStep } from './types'

/** (fiches combinazione + valore carte) × moltiplicatore, poi i jolly in ordine. */
export function scoreHand(cards: readonly Card[], jokers: readonly JokerId[]): ScoreResult {
  const { type, scoring } = evaluateHand(cards)
  const base = HAND_TABLE[type]
  const cardChips = scoring.reduce((sum, c) => sum + cardValue(c), 0)

  let chips = base.chips + cardChips
  let mult = base.mult
  const steps: ScoreStep[] = [
    { label: base.name, chips: base.chips, mult: base.mult },
    { label: 'Valore delle carte', chips: cardChips },
  ]

  for (const id of jokers) {
    const joker = JOKERS[id]
    const effect = joker.apply({ handType: type, scoring })
    if (!effect) continue
    if (effect.chips) chips += effect.chips
    if (effect.mult) mult += effect.mult
    if (effect.multTimes) mult *= effect.multTimes
    steps.push({ label: joker.name, ...effect })
  }

  return { type, scoring, chips, mult, points: chips * mult, steps }
}
