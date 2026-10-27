import {
  DISCARDS_PER_ROUND, HANDS_PER_ROUND, HAND_SIZE, HAND_TABLE, MAX_JOKERS, MAX_SELECTED,
  ROUND_REWARD, SHOP_SIZE, START_MONEY, TARGETS,
} from './constants'
import { cardName, createDeck, sortCards } from './deck'
import { JOKERS, JOKER_IDS } from './jokers'
import { nextRandom, shuffle } from './rng'
import { scoreHand } from './scoring'
import type { GameState, JokerId, SortMode } from './types'

export type Action =
  | { type: 'toggleCard'; id: string }
  | { type: 'play' }
  | { type: 'discard' }
  | { type: 'toggleSort' }
  | { type: 'buy'; id: JokerId }
  | { type: 'nextRound' }
  | { type: 'newGame'; seed: number }
  | { type: 'announce'; text: string }

function say(state: GameState, text: string): GameState {
  return { ...state, announcement: { id: state.announcement.id + 1, text } }
}

/** Prepara un round: mazzo nuovo mescolato, 8 carte in mano, contatori azzerati. */
function startRound(state: GameState, round: number): GameState {
  const [deck, seed] = shuffle(createDeck(), state.seed)
  const hand = sortCards(deck.slice(0, HAND_SIZE), state.sortMode)
  const target = TARGETS[round - 1]
  return say(
    {
      ...state,
      phase: 'playing',
      round,
      target,
      score: 0,
      handsLeft: HANDS_PER_ROUND,
      discardsLeft: DISCARDS_PER_ROUND,
      deck: deck.slice(HAND_SIZE),
      hand,
      selected: [],
      shop: [],
      lastResult: null,
      seed,
    },
    `Round ${round} di ${TARGETS.length}. Obiettivo ${target} punti. ` +
      `${HANDS_PER_ROUND} mani e ${DISCARDS_PER_ROUND} scarti. Hai ${hand.length} carte in mano.`,
  )
}

export function newGame(seed: number): GameState {
  const base: GameState = {
    version: 1,
    phase: 'playing',
    round: 1,
    target: TARGETS[0],
    score: 0,
    handsLeft: HANDS_PER_ROUND,
    discardsLeft: DISCARDS_PER_ROUND,
    money: START_MONEY,
    deck: [],
    hand: [],
    selected: [],
    sortMode: 'rank',
    jokers: [],
    shop: [],
    lastResult: null,
    seed: seed >>> 0,
    announcement: { id: 0, text: '' },
  }
  return startRound(base, 1)
}

function pickShop(state: GameState): { shop: JokerId[]; seed: number } {
  const pool = JOKER_IDS.filter((id) => !state.jokers.includes(id))
  const [shuffled, seed] = shuffle(pool, state.seed)
  return { shop: shuffled.slice(0, SHOP_SIZE), seed }
}

function draw(state: GameState, removeIds: string[]): Pick<GameState, 'hand' | 'deck'> {
  const kept = state.hand.filter((c) => !removeIds.includes(c.id))
  const need = Math.min(HAND_SIZE - kept.length, state.deck.length)
  const drawn = state.deck.slice(0, need)
  return {
    hand: sortCards([...kept, ...drawn], state.sortMode),
    deck: state.deck.slice(need),
  }
}

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'newGame':
      return newGame(action.seed)

    case 'announce':
      return say(state, action.text)

    case 'toggleCard': {
      if (state.phase !== 'playing') return state
      if (!state.hand.some((c) => c.id === action.id)) return state
      if (state.selected.includes(action.id)) {
        return { ...state, selected: state.selected.filter((id) => id !== action.id) }
      }
      if (state.selected.length >= MAX_SELECTED) {
        return say(state, `Puoi selezionare al massimo ${MAX_SELECTED} carte.`)
      }
      return { ...state, selected: [...state.selected, action.id] }
    }

    case 'toggleSort': {
      if (state.phase !== 'playing') return state
      const sortMode: SortMode = state.sortMode === 'rank' ? 'suit' : 'rank'
      return say(
        { ...state, sortMode, hand: sortCards(state.hand, sortMode) },
        sortMode === 'rank' ? 'Mano ordinata per valore.' : 'Mano ordinata per seme.',
      )
    }

    case 'discard': {
      if (state.phase !== 'playing') return state
      if (state.selected.length === 0) return say(state, 'Seleziona almeno una carta da scartare.')
      if (state.discardsLeft <= 0) return say(state, 'Non hai più scarti in questo round.')
      const next: GameState = {
        ...state,
        ...draw(state, state.selected),
        selected: [],
        discardsLeft: state.discardsLeft - 1,
      }
      return say(
        next,
        `Scartate ${state.selected.length} carte, ne hai pescate altrettante. ` +
          `Scarti rimasti: ${next.discardsLeft}.`,
      )
    }

    case 'play': {
      if (state.phase !== 'playing') return state
      if (state.selected.length === 0) return say(state, 'Seleziona da 1 a 5 carte da giocare.')
      const played = state.hand.filter((c) => state.selected.includes(c.id))
      const result = scoreHand(played, state.jokers)
      const score = state.score + result.points
      const handsLeft = state.handsLeft - 1
      const name = HAND_TABLE[result.type].name
      const gained = `${name}: ${result.chips} fiches × ${result.mult} = ${result.points} punti.`
      const base: GameState = { ...state, score, handsLeft, lastResult: result, selected: [] }

      if (score >= state.target) {
        const reward = ROUND_REWARD + handsLeft
        const hand = state.hand.filter((c) => !state.selected.includes(c.id))
        if (state.round >= TARGETS.length) {
          return say(
            { ...base, hand, phase: 'won' },
            `${gained} Totale ${score} su ${state.target}. Obiettivo finale raggiunto: hai vinto la partita!`,
          )
        }
        const money = state.money + reward
        const shopState = { ...base, hand, money }
        const { shop, seed } = pickShop(shopState)
        return say(
          { ...shopState, phase: 'shop', shop, seed },
          `${gained} Totale ${score} su ${state.target}: obiettivo raggiunto! ` +
            `Guadagni ${reward} monete, ne hai ${money}. Benvenuto al negozio.`,
        )
      }

      if (handsLeft <= 0) {
        const hand = state.hand.filter((c) => !state.selected.includes(c.id))
        return say(
          { ...base, hand, phase: 'lost' },
          `${gained} Totale ${score} su ${state.target}. Mani finite: partita persa.`,
        )
      }

      return say(
        { ...base, ...draw(state, state.selected) },
        `${gained} Totale ${score} su ${state.target}, mancano ${state.target - score} punti. ` +
          `Mani rimaste: ${handsLeft}.`,
      )
    }

    case 'buy': {
      if (state.phase !== 'shop') return state
      const joker = JOKERS[action.id]
      if (!state.shop.includes(action.id)) return state
      if (state.jokers.length >= MAX_JOKERS) return say(state, 'Hai già tutti gli slot jolly occupati.')
      if (state.money < joker.price) {
        return say(state, `Monete insufficienti per ${joker.name}: servono ${joker.price}, ne hai ${state.money}.`)
      }
      const money = state.money - joker.price
      return say(
        {
          ...state,
          money,
          jokers: [...state.jokers, action.id],
          shop: state.shop.filter((id) => id !== action.id),
        },
        `Hai comprato ${joker.name} per ${joker.price} monete. Monete rimaste: ${money}.`,
      )
    }

    case 'nextRound': {
      if (state.phase !== 'shop') return state
      return startRound(state, state.round + 1)
    }
  }
}

export function randomSeed(): number {
  return Math.floor(nextRandom(Date.now() ^ (Math.random() * 0xffffffff))[0] * 4294967296)
}

/** Descrizione testuale della mano selezionata, per l'anteprima. */
export function describeSelection(state: GameState): string {
  const cards = state.hand.filter((c) => state.selected.includes(c.id))
  return cards.map(cardName).join(', ')
}
