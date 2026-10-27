import { Component, ElementRef, afterNextRender, computed, input, output, viewChild } from '@angular/core';
import { MAX_JOKERS } from '../game/constants';
import { JOKERS } from '../game/jokers';
import type { GameState, JokerId } from '../game/types';

@Component({
  selector: 'app-shop',
  host: { class: 'shop', role: 'region', 'aria-labelledby': 'shop-title' },
  template: `
    <h2 id="shop-title" #title tabindex="-1">Bottega dell'Alchimista</h2>
    <p>
      Round {{ state().round }} superato con {{ state().score }} punti.
      Hai <strong>{{ state().money }} monete</strong>.
    </p>
    @if (state().shop.length === 0) {
      <p class="muted">La bottega è vuota: hai comprato tutto.</p>
    } @else {
      <ul class="shop-list">
        @for (id of state().shop; track id; let i = $index) {
          <li class="shop-item">
            <h3>{{ defs[id].name }}</h3>
            <p>{{ defs[id].description }}</p>
            <button
              type="button"
              class="btn"
              [attr.aria-disabled]="!canBuy(id)"
              (click)="buy.emit(id)"
            >
              Compra per {{ defs[id].price }} monete <kbd aria-hidden="true">{{ i + 1 }}</kbd>
            </button>
            @if (!canBuy(id)) {
              <p class="muted">{{ why(id) }}</p>
            }
          </li>
        }
      </ul>
    }
    <button type="button" class="btn btn-primary" (click)="next.emit()">
      Prossimo round <kbd aria-hidden="true">N</kbd>
    </button>
  `,
})
export class ShopComponent {
  readonly state = input.required<GameState>();
  readonly buy = output<JokerId>();
  readonly next = output<void>();
  protected readonly defs = JOKERS;
  private readonly title = viewChild.required<ElementRef<HTMLElement>>('title');
  private readonly full = computed(() => this.state().jokers.length >= MAX_JOKERS);

  constructor() {
    // All'apertura del negozio la mano sparisce: il focus passa al titolo.
    afterNextRender(() => this.title().nativeElement.focus());
  }

  protected canBuy(id: JokerId): boolean {
    return !this.full() && this.state().money >= JOKERS[id].price;
  }

  protected why(id: JokerId): string {
    return this.full()
      ? 'Slot jolly pieni.'
      : `Ti mancano ${JOKERS[id].price - this.state().money} monete.`;
  }
}
