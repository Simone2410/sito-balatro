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
      <div class="top-actions" data-nav-row>
        <button type="button" class="btn btn-small" aria-describedby="d-help" (click)="store.helpOpen.set(true)">
          Aiuto <kbd aria-hidden="true">?</kbd>
        </button>
        <button type="button" class="btn btn-small" aria-describedby="d-new" (click)="confirmNew()">
          Nuova partita <kbd aria-hidden="true">P</kbd>
        </button>
      </div>
      <p id="d-help" class="sr-only">
        Pulsante Aiuto. Premi Invio, Spazio o il tasto punto interrogativo per aprire l'elenco di tutte le scorciatoie.
      </p>
      <p id="d-new" class="sr-only">
        Pulsante Nuova partita. Premi Invio, Spazio o il tasto P per abbandonare la partita in corso e
        iniziarne una nuova. Ti verrà chiesta conferma.
      </p>
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
          <p id="d-hand" class="sr-only">
            Sei sulla mano. Freccia destra e sinistra per muoverti tra le carte, Spazio per selezionare
            o deselezionare, Invio o G per giocare, S per scartare, freccia giù per andare ai pulsanti.
          </p>
          <div class="actions" data-nav-row>
            <button type="button" class="btn btn-primary" aria-describedby="d-play"
              [attr.aria-disabled]="!canPlay()" (click)="play()">
              Gioca <kbd aria-hidden="true">G</kbd>
            </button>
            <button type="button" class="btn" aria-describedby="d-discard"
              [attr.aria-disabled]="!canDiscard()" (click)="discard()">
              Scarta ({{ s().discardsLeft }}) <kbd aria-hidden="true">S</kbd>
            </button>
            <button type="button" class="btn" aria-describedby="d-sort" (click)="sort()">
              Ordina: {{ s().sortMode === 'rank' ? 'per valore' : 'per seme' }}
              <kbd aria-hidden="true">O</kbd>
            </button>
          </div>
          <p id="d-play" class="sr-only">{{ playHelp() }}</p>
          <p id="d-discard" class="sr-only">{{ discardHelp() }}</p>
          <p id="d-sort" class="sr-only">
            Pulsante Ordina. Ora la mano è ordinata {{ s().sortMode === 'rank' ? 'per valore' : 'per seme' }}.
            Premi Invio, Spazio o il tasto O per ordinarla {{ s().sortMode === 'rank' ? 'per seme' : 'per valore' }}.
          </p>
          <p class="hint">
            Frecce per muoverti (anche tra i pulsanti), Spazio per selezionare, G per giocare,
            S per scartare, P per una nuova partita, ? per l'aiuto.
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

  protected readonly playHelp = computed(() => {
    const n = this.s().selected.length;
    return n > 0
      ? `Pulsante Gioca. Hai selezionato ${n} ${n === 1 ? 'carta' : 'carte'}. ` +
          'Premi Invio, Spazio o il tasto G per giocarle.'
      : 'Pulsante Gioca, non disponibile: seleziona prima da 1 a 5 carte. Poi premi Invio, Spazio o il tasto G.';
  });
  protected readonly discardHelp = computed(() => {
    const s = this.s();
    if (s.discardsLeft <= 0) return 'Pulsante Scarta, non disponibile: non hai più scarti in questo round.';
    if (s.selected.length === 0) {
      return `Pulsante Scarta, non disponibile: seleziona prima le carte da scartare. Scarti rimasti: ${s.discardsLeft}.`;
    }
    return `Pulsante Scarta. Scarti rimasti: ${s.discardsLeft}. Premi Invio, Spazio o il tasto S per scartare le carte selezionate.`;
  });

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

  /**
   * Frecce su tutti i comandi. I comandi sono organizzati in righe (`data-nav-row`):
   * sinistra/destra scorrono dentro la riga, su/giù passano alla riga precedente/successiva.
   * Le carte gestiscono da sole sinistra/destra (HandComponent); su/giù arrivano qui.
   */
  private navigate(e: KeyboardEvent): void {
    const target = e.target as HTMLElement | null;
    const row = target?.closest<HTMLElement>('[data-nav-row]');
    const current = target?.closest<HTMLElement>('button, app-card');
    if (!row || !current) return;
    const itemsOf = (r: HTMLElement) => Array.from(r.querySelectorAll<HTMLElement>('button, app-card'));
    const items = itemsOf(row);
    const i = items.indexOf(current);

    let next: HTMLElement | undefined;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      next = items[i + (e.key === 'ArrowRight' ? 1 : -1)];
    } else {
      const rows = Array.from(document.querySelectorAll<HTMLElement>('[data-nav-row]'));
      const step = e.key === 'ArrowDown' ? 1 : -1;
      for (let r = rows.indexOf(row) + step; r >= 0 && r < rows.length && !next; r += step) {
        const list = itemsOf(rows[r]);
        if (list.length === 0) continue;
        next =
          rows[r].getAttribute('role') === 'listbox'
            ? (rows[r].querySelector<HTMLElement>('[tabindex="0"]') ?? list[0])
            : list[Math.min(i, list.length - 1)];
      }
    }
    if (!next) return;
    e.preventDefault();
    next.focus();
  }

  @HostListener('document:keydown', ['$event'])
  protected onKey(e: KeyboardEvent): void {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === '?') {
      e.preventDefault();
      this.store.helpOpen.set(true);
      return;
    }
    if (this.store.helpOpen() || e.repeat || e.defaultPrevented) return;

    if (e.key.startsWith('Arrow')) {
      this.navigate(e);
      return;
    }

    const key = e.key.toLowerCase();
    const s = this.s();
    const digit = /^[1-9]$/.test(key) ? Number(key) : 0;

    if (key === 'a') {
      this.store.dispatch({ type: 'announce', text: this.store.status() });
    } else if (key === 'p') {
      this.confirmNew();
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

