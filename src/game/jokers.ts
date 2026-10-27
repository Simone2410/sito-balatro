import type { Card, HandType, JokerId, ScoreStep } from './types'

export interface JokerContext {
  handType: HandType
  scoring: Card[]
}

export interface JokerDef {
  id: JokerId
  name: string
  description: string
  price: number
  /** Restituisce il contributo al punteggio, o null se non si attiva. */
  apply(ctx: JokerContext): Omit<ScoreStep, 'label'> | null
}

export const JOKERS: Record<JokerId, JokerDef> = {
  sale: {
    id: 'sale',
    name: 'Sale Filosofale',
    description: '+30 fiches a ogni mano giocata.',
    price: 4,
    apply: () => ({ chips: 30 }),
  },
  mercurio: {
    id: 'mercurio',
    name: 'Mercurio Vivo',
    description: '+4 al moltiplicatore a ogni mano giocata.',
    price: 6,
    apply: () => ({ mult: 4 }),
  },
  fornace: {
    id: 'fornace',
    name: 'Fornace Ardente',
    description: '+3 al moltiplicatore per ogni carta di Fuoco che fa punti.',
    price: 5,
    apply: ({ scoring }) => {
      const n = scoring.filter((c) => c.suit === 'fuoco').length
      return n > 0 ? { mult: 3 * n } : null
    },
  },
  bilancia: {
    id: 'bilancia',
    name: 'Bilancia del Mago',
    description: '+15 fiches per ogni figura (Fante, Regina, Re) che fa punti.',
    price: 5,
    apply: ({ scoring }) => {
      const n = scoring.filter((c) => c.rank >= 11 && c.rank <= 13).length
      return n > 0 ? { chips: 15 * n } : null
    },
  },
  specchio: {
    id: 'specchio',
    name: 'Specchio Gemello',
    description: 'Moltiplicatore ×2 se la combinazione è Coppia, Doppia coppia o Full.',
    price: 7,
    apply: ({ handType }) =>
      handType === 'pair' || handType === 'twoPair' || handType === 'full'
        ? { multTimes: 2 }
        : null,
  },
}

export const JOKER_IDS = Object.keys(JOKERS) as JokerId[]
