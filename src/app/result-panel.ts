import { Component, computed, input } from '@angular/core';
import { HAND_TABLE } from '../game/constants';
import { cardName } from '../game/deck';
import { evaluateHand } from '../game/hands';
import type { Card, ScoreResult, ScoreStep } from '../game/types';

/** Anteprima della selezione e dettaglio dell'ultima mano. Tutto è testo sempre visibile. */
@Component({
  selector: 'app-result-panel',
  host: { class: 'result', role: 'region', 'aria-label': 'Combinazione' },
  template: `
    <p class="preview">
      @if (preview(); as p) {
        Selezione: <strong>{{ table[p.type].name }}</strong>
        <span class="muted"> ({{ table[p.type].chips }} fiches × {{ table[p.type].mult }})</span>
      } @else {
        <span class="muted">Seleziona da 1 a 5 carte (Spazio, oppure tocca la carta).</span>
      }
    </p>
    @if (last(); as l) {
      <details class="last-hand">
        <summary>Ultima mano: {{ table[l.type].name }}, {{ l.points }} punti</summary>
        <p class="muted">Carte che fanno punti: {{ names(l) }}.</p>
        <ul>
          @for (s of l.steps; track $index) {
            <li>{{ s.label }}: {{ stepText(s) }}</li>
          }
          <li><strong>Totale: {{ l.chips }} × {{ l.mult }} = {{ l.points }}</strong></li>
        </ul>
      </details>
    }
  `,
})
export class ResultPanelComponent {
  readonly selection = input.required<Card[]>();
  readonly last = input.required<ScoreResult | null>();
  protected readonly table = HAND_TABLE;
  protected readonly preview = computed(() =>
    this.selection().length > 0 ? evaluateHand(this.selection()) : null,
  );

  protected names(r: ScoreResult): string {
    return r.scoring.map(cardName).join(', ');
  }

  protected stepText(s: ScoreStep): string {
    const parts: string[] = [];
    if (s.chips) parts.push(`+${s.chips} fiches`);
    if (s.mult) parts.push(`+${s.mult} moltiplicatore`);
    if (s.multTimes) parts.push(`moltiplicatore ×${s.multTimes}`);
    return parts.join(', ');
  }
}
