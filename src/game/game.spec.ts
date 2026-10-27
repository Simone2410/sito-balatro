import { describe, expect, it } from 'vitest'
import { createDeck } from './deck'
import { evaluateHand } from './hands'
import { scoreHand } from './scoring'
import { newGame, reducer } from './state'
import type { Card, Rank, Suit } from './types'

const c = (rank: Rank, suit: Suit = 'fuoco'): Card => ({ id: `${suit}-${rank}`, rank, suit })

describe('riconoscimento combinazioni', () => {
  it('carta alta', () => expect(evaluateHand([c(2), c(9, 'acqua'), c(13, 'terra')]).type).toBe('high'))
  it('coppia', () => expect(evaluateHand([c(5), c(5, 'acqua'), c(9)]).type).toBe('pair'))
  it('doppia coppia', () =>
    expect(evaluateHand([c(5), c(5, 'acqua'), c(9), c(9, 'terra')]).type).toBe('twoPair'))
  it('tris', () => expect(evaluateHand([c(7), c(7, 'acqua'), c(7, 'terra')]).type).toBe('trips'))
  it('scala', () =>
    expect(
      evaluateHand([c(5), c(6, 'acqua'), c(7, 'terra'), c(8, 'aria'), c(9)]).type,
    ).toBe('straight'))
  it('scala con asso basso', () =>
    expect(
      evaluateHand([c(14), c(2, 'acqua'), c(3, 'terra'), c(4, 'aria'), c(5)]).type,
    ).toBe('straight'))
  it('colore', () =>
    expect(evaluateHand([c(2), c(5), c(7), c(9), c(13)]).type).toBe('flush'))
  it('full', () =>
    expect(
      evaluateHand([c(4), c(4, 'acqua'), c(4, 'terra'), c(9), c(9, 'acqua')]).type,
    ).toBe('full'))
  it('poker', () =>
    expect(
      evaluateHand([c(8), c(8, 'acqua'), c(8, 'terra'), c(8, 'aria'), c(2)]).type,
    ).toBe('quads'))
  it('scala colore', () =>
    expect(evaluateHand([c(5), c(6), c(7), c(8), c(9)]).type).toBe('straightFlush'))
  it('4 carte non sono mai una scala', () =>
    expect(evaluateHand([c(5), c(6, 'acqua'), c(7), c(8)]).type).toBe('high'))
})

describe('punteggio', () => {
  it('coppia di re = (10 + 10 + 10) × 2 = 60', () => {
    const r = scoreHand([c(13), c(13, 'acqua'), c(3)], [])
    expect(r.points).toBe(60)
  })
  it('asso vale 11', () => expect(scoreHand([c(14)], []).points).toBe((5 + 11) * 1))
  it('i jolly modificano il punteggio', () => {
    const r = scoreHand([c(13), c(13, 'acqua')], ['sale', 'mercurio', 'specchio'])
    // fiches 10+20+30 = 60, molt (2+4)×2 = 12
    expect(r.points).toBe(60 * 12)
  })
})

describe('partita', () => {
  it('mazzo da 52 carte uniche', () => {
    expect(new Set(createDeck().map((x) => x.id)).size).toBe(52)
  })
  it('inizia con 8 carte, 4 mani, 3 scarti', () => {
    const g = newGame(1)
    expect([g.hand.length, g.handsLeft, g.discardsLeft, g.target]).toEqual([8, 4, 3, 300])
  })
  it('scartare rimpiazza le carte e consuma uno scarto', () => {
    let g = newGame(1)
    g = reducer(g, { type: 'toggleCard', id: g.hand[0].id })
    g = reducer(g, { type: 'discard' })
    expect(g.hand.length).toBe(8)
    expect(g.discardsLeft).toBe(2)
  })
  it('non si selezionano più di 5 carte', () => {
    let g = newGame(1)
    for (const card of g.hand.slice(0, 6)) g = reducer(g, { type: 'toggleCard', id: card.id })
    expect(g.selected.length).toBe(5)
  })
  it('finite le mani sotto obiettivo la partita è persa', () => {
    let g = newGame(1)
    for (let i = 0; i < 4; i++) {
      g = reducer(g, { type: 'toggleCard', id: g.hand[g.hand.length - 1].id })
      g = reducer(g, { type: 'play' })
    }
    expect(g.phase).toBe('lost')
  })
  it('raggiunto l\'obiettivo si apre il negozio e si guadagna denaro', () => {
    let g = newGame(1)
    g = { ...g, score: 290 }
    g = reducer(g, { type: 'toggleCard', id: g.hand[0].id })
    g = reducer(g, { type: 'play' })
    expect(g.phase).toBe('shop')
    expect(g.money).toBeGreaterThan(4)
    expect(g.shop.length).toBe(3)
  })
  it('acquisto jolly e passaggio al round 2', () => {
    let g = newGame(1)
    g = { ...g, phase: 'shop', money: 20, shop: ['sale', 'mercurio'] }
    g = reducer(g, { type: 'buy', id: 'sale' })
    expect(g.jokers).toEqual(['sale'])
    expect(g.money).toBe(16)
    g = reducer(g, { type: 'nextRound' })
    expect([g.round, g.target, g.hand.length]).toEqual([2, 600, 8])
  })
})
