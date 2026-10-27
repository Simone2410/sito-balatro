import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { filter } from 'rxjs';
import { EndScreenComponent } from './end-screen';
import { GameStore } from './game-store';
import { HandComponent } from './hand';
import { HelpDialogComponent } from './help-dialog';
import { HudComponent } from './hud';
import { JokerBarComponent } from './joker-bar';
import { ResultPanelComponent } from './result-panel';
import { ShopComponent } from './shop';

@Component({
  selector: 'app-root',
  imports: [
    EndScreenComponent, HandComponent, HelpDialogComponent, HudComponent, JokerBarComponent,
    ResultPanelComponent, ShopComponent,
  ],
  template: `
    <a class="skip" href="#main">Vai al gioco</a>
    <header class="top">
      <h1>Alambicco</h1>
      <div class="top-actions">
        <button type="button" class="btn btn-small" (click)="store.helpOpen.set(true)">
          Aiuto <kbd aria-hidden="true">?</kbd>
        </button>
        <button type="button" class="btn btn-small" (click)="confirmNew()">Nuova partita</button>
      </div>
    </header>

    @if (updateReady()) {
      <div class="update" role="alert">
        <span>È disponibile una nuova versione.</span>
        <button type="button" class="btn btn-small" (click)="reload()">Aggiorna ora</button>
      </div>
    }

    <!-- Annunci per screen reader: il span con track per id fa rileggere anche testi uguali. -->
    <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
      @for (a of [s().announcement]; track a.id) {
        <span>{{ a.text }}</span>
      }
    </div>

    <main id="main" tabindex="-1">
      <app-hud [state]="s()" />
      <p class="message" aria-hidden="true">{{ s().announcement.text }}</p>

      @switch (s().phase) {
        @case ('playing') {
          <app-hand
            [hand]="s().hand"
            [selected]="s().selected"
            [focusSignal]="store.focusSignal()"
            (toggle)="store.dispatch({ type: 'toggleCard', id: $event })"
            (play)="play()"
          />
          <div class="actions">
            <button type="button" class="btn btn-primary" [attr.aria-disabled]="!canPlay()" (click)="play()">
              Gioca <kbd aria-hidden="true">G</kbd>
            </button>
            <button type="button" class="btn" [attr.aria-disabled]="!canDiscard()" (click)="discard()">
              Scarta ({{ s().discardsLeft }}) <kbd aria-hidden="true">S</kbd>
            </button>
            <button type="button" class="btn" (click)="sort()">
              Ordina: {{ s().sortMode === 'rank' ? 'per valore' : 'per seme' }}
              <kbd aria-hidden="true">O</kbd>
            </button>
          </div>
          <p class="hint">
            Frecce per muoverti, Spazio per selezionare, G per giocare, S per scartare, ? per l'aiuto.
          </p>
          <app-result-panel [selection]="selection()" [last]="s().lastResult" />
          <app-joker-bar [jokers]="s().jokers" />
        }
        @case ('shop') {
          <app-joker-bar [jokers]="s().jokers" />
          <app-shop
            [state]="s()"
            (buy)="store.dispatch({ type: 'buy', id: $event })"
            (next)="nextRound()"
          />
        }
        @default {
          <app-end-screen [state]="s()" (newGame)="store.newGame()" />
        }
      }
    </main>

    <app-help-dialog [open]="store.helpOpen()" (closed)="store.helpOpen.set(false)" />
  `,
})
export class App {
  protected readonly store = inject(GameStore);
  protected readonly s = this.store.state;
  protected readonly updateReady = signal(false);

  protected readonly selection = computed(() =>
    this.s().hand.filter((c) => this.s().selected.includes(c.id)),
  );
  protected readonly canPlay = computed(() => this.s().selected.length > 0);
  protected readonly canDiscard = computed(
    () => this.s().selected.length > 0 && this.s().discardsLeft > 0,
  );

  constructor() {
    const sw = inject(SwUpdate);
    if (sw.isEnabled) {
      sw.versionUpdates
        .pipe(filter((e) => e.type === 'VERSION_READY'))
        .subscribe(() => {
          this.updateReady.set(true);
          this.store.dispatch({ type: 'announce', text: 'È disponibile una nuova versione dell\'app.' });
        });
    }
  }

  protected play(): void {
    this.store.dispatch({ type: 'play' }, true);
  }
  protected discard(): void {
    this.store.dispatch({ type: 'discard' }, true);
  }
  protected sort(): void {
    this.store.dispatch({ type: 'toggleSort' }, true);
  }
  protected nextRound(): void {
    this.store.dispatch({ type: 'nextRound' }, true);
  }
  protected reload(): void {
    location.reload();
  }
  protected confirmNew(): void {
    const s = this.s();
    if (s.phase === 'playing' || s.phase === 'shop') {
      if (!confirm('Vuoi abbandonare la partita in corso e iniziarne una nuova?')) return;
    }
    this.store.newGame();
  }

  @HostListener('document:keydown', ['$event'])
  protected onKey(e: KeyboardEvent): void {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === '?') {
      e.preventDefault();
      this.store.helpOpen.set(true);
      return;
    }
    if (this.store.helpOpen() || e.repeat) return;

    const key = e.key.toLowerCase();
    const s = this.s();
    const digit = /^[1-9]$/.test(key) ? Number(key) : 0;

    if (key === 'a') {
      this.store.dispatch({ type: 'announce', text: this.store.status() });
    } else if (s.phase === 'playing') {
      if (key === 'g') this.play();
      else if (key === 's') this.discard();
      else if (key === 'o') this.sort();
      else if (digit >= 1 && digit <= 8 && s.hand[digit - 1]) {
        this.store.dispatch({ type: 'toggleCard', id: s.hand[digit - 1].id });
      } else return;
    } else if (s.phase === 'shop') {
      if (key === 'n') this.nextRound();
      else if (digit >= 1 && s.shop[digit - 1]) {
        this.store.dispatch({ type: 'buy', id: s.shop[digit - 1] });
      } else return;
    } else if (key === 'n') {
      this.store.newGame();
    } else return;
    e.preventDefault();
  }
}

