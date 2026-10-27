import { Component, computed, input, output } from '@angular/core';
import { SUIT_INFO } from '../game/constants';
import { cardName, rankLabel } from '../game/deck';
import type { Card } from '../game/types';

/** Una carta: role="option" nel listbox della mano. Seme = simbolo + nome + colore. */
@Component({
  selector: 'app-card',
  host: {
    role: 'option',
    class: 'card',
    '[attr.data-suit]': 'card().suit',
    '[attr.aria-selected]': 'selected()',
    '[attr.aria-label]': 'label()',
    '[attr.tabindex]': 'tabIndex()',
    '[class.is-selected]': 'selected()',
    '(click)': 'toggled.emit()',
    '(focus)': 'focused.emit()',
  },
  template: `
    <span class="card-key" aria-hidden="true">{{ index() + 1 }}</span>
    <span class="card-rank" aria-hidden="true">{{ rank() }}</span>
    <span class="card-symbol" aria-hidden="true">{{ suit().symbol }}</span>
    <span class="card-suit-name" aria-hidden="true">{{ suit().name }}</span>
    @if (selected()) {
      <span class="card-check" aria-hidden="true">✓</span>
    }
  `,
})
export class CardComponent {
  readonly card = input.required<Card>();
  readonly selected = input(false);
  readonly tabIndex = input(-1);
  readonly index = input(0);
  readonly toggled = output<void>();
  readonly focused = output<void>();

  protected readonly suit = computed(() => SUIT_INFO[this.card().suit]);
  protected readonly rank = computed(() => rankLabel(this.card().rank));
  protected readonly label = computed(
    () => `${cardName(this.card())}${this.selected() ? ', selezionata' : ''}`,
  );
}
