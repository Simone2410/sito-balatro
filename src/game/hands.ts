import type { Card, HandResult } from './types'

function isStraight(ranks: number[]): boolean {
  const sorted = [...new Set(ranks)].sort((a, b) => a - b)
  if (sorted.length !== 5) return false
  if (sorted[4] - sorted[0] === 4) return true
  // Ruota: A-2-3-4-5
  return sorted.join(',') === '2,3,4,5,14'
}

/** Riconosce la combinazione di 1-5 carte e le carte che contribuiscono al punteggio. */
export function evaluateHand(cards: readonly Card[]): HandResult {
  if (cards.length === 0) throw new Error('Nessuna carta da valutare')

  const groups = new Map<number, Card[]>()
  for (const c of cards) groups.set(c.rank, [...(groups.get(c.rank) ?? []), c])
  const byCount = [...groups.values()].sort(
    (a, b) => b.length - a.length || b[0].rank - a[0].rank,
  )
  const counts = byCount.map((g) => g.length)

  const five = cards.length === 5
  const flush = five && cards.every((c) => c.suit === cards[0].suit)
  const straight = five && isStraight(cards.map((c) => c.rank))
  const all = [...cards]

  if (straight && flush) return { type: 'straightFlush', scoring: all }
  if (counts[0] === 4) return { type: 'quads', scoring: byCount[0] }
  if (counts[0] === 3 && counts[1] === 2) return { type: 'full', scoring: all }
  if (flush) return { type: 'flush', scoring: all }
  if (straight) return { type: 'straight', scoring: all }
  if (counts[0] === 3) return { type: 'trips', scoring: byCount[0] }
  if (counts[0] === 2 && counts[1] === 2) {
    return { type: 'twoPair', scoring: [...byCount[0], ...byCount[1]] }
  }
  if (counts[0] === 2) return { type: 'pair', scoring: byCount[0] }
  const highest = [...cards].sort((a, b) => b.rank - a.rank)[0]
  return { type: 'high', scoring: [highest] }
}
