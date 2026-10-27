import { Injectable, effect, signal } from '@angular/core';
import { loadGame, saveGame } from '../game/save';
import { Action, newGame, randomSeed, reducer } from '../game/state';
import type { GameState } from '../game/types';

/** Unico punto di contatto tra l'interfaccia Angular e la logica pura in src/game/. */
@Injectable({ providedIn: 'root' })
export class GameStore {
  readonly state = signal<GameState>(this.initial());
  /** Incrementato quando il focus va riportato sulla mano dopo giocata, scarto, ordinamento. */
  readonly focusSignal = signal(0);
  readonly helpOpen = signal(false);

  constructor() {
    // Salvataggio automatico a ogni cambio di stato: la partita riprende dopo la chiusura.
    effect(() => saveGame(this.state()));
  }

  private initial(): GameState {
    const saved = loadGame();
    if (!saved) return newGame(randomSeed());
    return reducer(saved, {
      type: 'announce',
      text:
        `Partita ripresa. Round ${saved.round}, ${saved.score} punti su ${saved.target}. ` +
        `Mani ${saved.handsLeft}, scarti ${saved.discardsLeft}, monete ${saved.money}.`,
    });
  }

  dispatch(action: Action, refocusHand = false): void {
    this.state.update((s) => reducer(s, action));
    if (refocusHand) this.focusSignal.update((n) => n + 1);
  }

  newGame(): void {
    this.dispatch({ type: 'newGame', seed: randomSeed() }, true);
  }

  status(): string {
    const s = this.state();
    return (
      `Round ${s.round}, obiettivo ${s.target}, punti ${s.score}, mancano ${Math.max(0, s.target - s.score)}. ` +
      `Mani ${s.handsLeft}, scarti ${s.discardsLeft}, monete ${s.money}, jolly ${s.jokers.length}.`
    );
  }
}
