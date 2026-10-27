export type Suit = 'fuoco' | 'acqua' | 'terra' | 'aria'
export type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14

export interface Card {
  id: string
  rank: Rank
  suit: Suit
}

export type HandType =
  | 'high' | 'pair' | 'twoPair' | 'trips' | 'straight'
  | 'flush' | 'full' | 'quads' | 'straightFlush'

export type JokerId = 'sale' | 'mercurio' | 'fornace' | 'bilancia' | 'specchio'

export type SortMode = 'rank' | 'suit'
export type Phase = 'playing' | 'shop' | 'won' | 'lost'

export interface HandResult {
  type: HandType
  scoring: Card[]
}

export interface ScoreStep {
  label: string
  chips?: number
  mult?: number
  multTimes?: number
}

export interface ScoreResult {
  type: HandType
  scoring: Card[]
  chips: number
  mult: number
  points: number
  steps: ScoreStep[]
}

export interface Announcement {
  id: number
  text: string
}

export interface GameState {
  version: 1
  phase: Phase
  round: number
  target: number
  score: number
  handsLeft: number
  discardsLeft: number
  money: number
  deck: Card[]
  hand: Card[]
  selected: string[]
  sortMode: SortMode
  jokers: JokerId[]
  shop: JokerId[]
  lastResult: ScoreResult | null
  seed: number
  announcement: Announcement
}
