import { SUITS, SUIT_INFO, RANK_NAME, RANK_SHORT } from './constants'
import type { Card, Rank, SortMode } from './types'

export function createDeck(): Card[] {
  const cards: Card[] = []
  for (const suit of SUITS) {
    for (let rank = 2; rank <= 14; rank++) {
      cards.push({ id: `${suit}-${rank}`, rank: rank as Rank, suit })
    }
  }
  return cards
}

/** Valore in fiches: numeri = numero, J/Q/K = 10, asso = 11. */
export function cardValue(card: Card): number {
  if (card.rank === 14) return 11
  if (card.rank >= 11) return 10
  return card.rank
}

export function cardName(card: Card): string {
  return `${RANK_NAME[card.rank]} di ${SUIT_INFO[card.suit].name}`
}

export function rankLabel(rank: Rank): string {
  return RANK_SHORT[rank] ?? String(rank)
}

const suitIndex = (c: Card) => SUITS.indexOf(c.suit)

export function sortCards(cards: readonly Card[], mode: SortMode): Card[] {
  return [...cards].sort((a, b) =>
    mode === 'rank'
      ? b.rank - a.rank || suitIndex(a) - suitIndex(b)
      : suitIndex(a) - suitIndex(b) || b.rank - a.rank,
  )
}
