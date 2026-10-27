import type { HandType, Suit } from './types'

export const HAND_SIZE = 8
export const MAX_SELECTED = 5
export const HANDS_PER_ROUND = 4
export const DISCARDS_PER_ROUND = 3
export const TARGETS = [300, 600, 1000] as const
export const MAX_JOKERS = 5
export const START_MONEY = 4
export const ROUND_REWARD = 5
export const SHOP_SIZE = 3

export const HAND_TABLE: Record<HandType, { name: string; chips: number; mult: number }> = {
  high: { name: 'Carta alta', chips: 5, mult: 1 },
  pair: { name: 'Coppia', chips: 10, mult: 2 },
  twoPair: { name: 'Doppia coppia', chips: 20, mult: 2 },
  trips: { name: 'Tris', chips: 30, mult: 3 },
  straight: { name: 'Scala', chips: 30, mult: 4 },
  flush: { name: 'Colore', chips: 35, mult: 4 },
  full: { name: 'Full', chips: 40, mult: 4 },
  quads: { name: 'Poker', chips: 60, mult: 7 },
  straightFlush: { name: 'Scala colore', chips: 100, mult: 8 },
}

export const HAND_ORDER: HandType[] = [
  'high', 'pair', 'twoPair', 'trips', 'straight', 'flush', 'full', 'quads', 'straightFlush',
]

export const SUITS: Suit[] = ['fuoco', 'acqua', 'terra', 'aria']

// Il seme è sempre comunicato da forma + nome, mai solo dal colore.
export const SUIT_INFO: Record<Suit, { name: string; symbol: string }> = {
  fuoco: { name: 'Fuoco', symbol: '▲' },
  acqua: { name: 'Acqua', symbol: '●' },
  terra: { name: 'Terra', symbol: '■' },
  aria: { name: 'Aria', symbol: '◆' },
}

export const RANK_NAME: Record<number, string> = {
  2: 'Due', 3: 'Tre', 4: 'Quattro', 5: 'Cinque', 6: 'Sei', 7: 'Sette', 8: 'Otto',
  9: 'Nove', 10: 'Dieci', 11: 'Fante', 12: 'Regina', 13: 'Re', 14: 'Asso',
}

export const RANK_SHORT: Record<number, string> = {
  11: 'J', 12: 'Q', 13: 'K', 14: 'A',
}
