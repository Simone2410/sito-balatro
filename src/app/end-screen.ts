import { Component, ElementRef, afterNextRender, computed, input, output, viewChild } from '@angular/core';
import type { GameState } from '../game/types';

@Component({
  selector: 'app-end-screen',
  host: { class: 'end', role: 'region', 'aria-labelledby': 'end-title' },
  template: `
    <h2 id="end-title">{{ won() ? 'Gran Opera compiuta!' : 'Il crogiolo si è spento' }}</h2>
    <p>
      @if (won()) {
        Hai superato tutti e 3 i round con {{ state().money }} monete.
      } @else {
        Round {{ state().round }}: hai fatto {{ state().score }} punti su {{ state().target }}.
        Le mani sono finite.
      }
    </p>
    <div data-nav-row>
      <button #btn type="button" class="btn btn-primary" aria-describedby="d-end" (click)="newGame.emit()">
        Nuova partita <kbd aria-hidden="true">N</kbd>
      </button>
    </div>
    <span id="d-end" class="sr-only">
      Pulsante Nuova partita. Premi Invio, Spazio o il tasto N per iniziare una nuova partita.
    </span>
  `,
})
export class EndScreenComponent {
  readonly state = input.required<GameState>();
  readonly newGame = output<void>();
  protected readonly won = computed(() => this.state().phase === 'won');
  private readonly btn = viewChild.required<ElementRef<HTMLElement>>('btn');

  constructor() {
    afterNextRender(() => this.btn().nativeElement.focus());
  }
}
