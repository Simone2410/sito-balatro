import { Component, input } from '@angular/core';
import { MAX_JOKERS } from '../game/constants';
import { JOKERS } from '../game/jokers';
import type { JokerId } from '../game/types';

@Component({
  selector: 'app-joker-bar',
  host: { class: 'jokers', role: 'region', 'aria-labelledby': 'jokers-title' },
  template: `
    <h2 id="jokers-title">Jolly ({{ jokers().length }}/{{ max }})</h2>
    @if (jokers().length === 0) {
      <p class="muted">Nessun jolly. Ne troverai nel negozio, tra un round e l'altro.</p>
    } @else {
      <ul class="joker-list">
        @for (id of jokers(); track id) {
          <li class="joker">
            <strong>{{ defs[id].name }}</strong>
            <span>{{ defs[id].description }}</span>
          </li>
        }
      </ul>
    }
  `,
})
export class JokerBarComponent {
  readonly jokers = input.required<JokerId[]>();
  protected readonly max = MAX_JOKERS;
  protected readonly defs = JOKERS;
}
