import type { GameState } from './types'

const KEY = 'alambicco:partita:v1'
const PHASES = ['playing', 'shop']

/** Controllo minimo di forma: un salvataggio corrotto o vecchio viene ignorato. */
function isValid(s: unknown): s is GameState {
  if (!s || typeof s !== 'object') return false
  const g = s as Partial<GameState>
  return (
    g.version === 1 &&
    typeof g.phase === 'string' && PHASES.includes(g.phase) &&
    typeof g.round === 'number' && typeof g.score === 'number' &&
    typeof g.target === 'number' && typeof g.money === 'number' &&
    typeof g.handsLeft === 'number' && typeof g.discardsLeft === 'number' &&
    Array.isArray(g.hand) && Array.isArray(g.deck) && Array.isArray(g.selected) &&
    Array.isArray(g.jokers) && Array.isArray(g.shop) &&
    typeof g.seed === 'number' && !!g.announcement
  )
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isValid(parsed) ? parsed : null
  } catch {
    return null
  }
}

/** Salva solo le partite in corso; a partita finita il salvataggio viene cancellato. */
export function saveGame(state: GameState): void {
  try {
    if (state.phase === 'playing' || state.phase === 'shop') {
      localStorage.setItem(KEY, JSON.stringify(state))
    } else {
      localStorage.removeItem(KEY)
    }
  } catch {
    // Archiviazione non disponibile (modalità privata, quota): si gioca comunque.
  }
}
