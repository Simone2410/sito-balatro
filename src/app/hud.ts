import { Component, computed, input } from '@angular/core';
import { TARGETS } from '../game/constants';
import type { GameState } from '../game/types';

@Component({
  selector: 'app-hud',
  host: { class: 'hud', role: 'region', 'aria-label': 'Stato della partita' },
  template: `
    <dl class="stats">
      <div><dt>Round</dt><dd>{{ state().round }} / {{ rounds }}</dd></div>
      <div><dt>Obiettivo</dt><dd>{{ state().target }}</dd></div>
      <div><dt>Punti</dt><dd>{{ state().score }}</dd></div>
      <div><dt>Mani</dt><dd>{{ state().handsLeft }}</dd></div>
      <div><dt>Scarti</dt><dd>{{ state().discardsLeft }}</dd></div>
      <div><dt>Monete</dt><dd>{{ state().money }}</dd></div>
    </dl>
    <div
      class="progress"
      role="progressbar"
      aria-label="Avanzamento verso l'obiettivo"
      aria-valuemin="0"
      [attr.aria-valuemax]="state().target"
      [attr.aria-valuenow]="clamped()"
      [attr.aria-valuetext]="state().score + ' punti su ' + state().target"
    >
      <div class="progress-bar" [style.width.%]="pct()"></div>
      <span class="progress-text">{{ state().score }} / {{ state().target }}</span>
    </div>
  `,
})
export class HudComponent {
  readonly state = input.required<GameState>();
  protected readonly rounds = TARGETS.length;
  protected readonly clamped = computed(() => Math.min(this.state().score, this.state().target));
  protected readonly pct = computed(() =>
    Math.min(100, Math.round((this.state().score / this.state().target) * 100)),
  );
}
