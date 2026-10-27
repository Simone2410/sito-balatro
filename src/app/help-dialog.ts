import { Component, ElementRef, effect, input, output, viewChild } from '@angular/core';
import { HAND_ORDER, HAND_TABLE, MAX_JOKERS } from '../game/constants';
import { JOKERS, JOKER_IDS } from '../game/jokers';

export const SHORTCUTS: [string, string][] = [
  ['← →', 'Muoviti tra le carte, o tra i pulsanti della stessa riga'],
  ['↑ ↓', 'Passa tra le righe: Aiuto / Nuova partita, mano, Gioca / Scarta / Ordina'],
  ['Home / Fine', 'Prima / ultima carta'],
  ['Invio o Spazio', 'Attiva il pulsante su cui ti trovi (sulle carte: Spazio seleziona)'],
  ['P', 'Nuova partita (abbandona quella in corso, con conferma)'],
  ['Spazio', 'Seleziona o deseleziona la carta (da 1 a 5)'],
  ['1 – 8', 'Seleziona o deseleziona la carta in quella posizione'],
  ['G oppure Invio', 'Gioca le carte selezionate'],
  ['S', 'Scarta le carte selezionate'],
  ['O', 'Ordina la mano: alterna valore e seme'],
  ['A', 'Rileggi lo stato della partita'],
  ['Negozio: 1 – 3', 'Compra il jolly in quella posizione'],
  ['Negozio: N', 'Prossimo round'],
  ['Fine partita: N', 'Nuova partita'],
  ['?', 'Apri questo aiuto'],
  ['Esc', 'Chiudi questo aiuto'],
  ['Tab', 'Vai ai pulsanti e agli altri comandi'],
];

/** Dialogo nativo <dialog>: focus intrappolato, Esc e ripristino del focus li gestisce il browser. */
@Component({
  selector: 'app-help-dialog',
  template: `
    <dialog #dlg class="help" aria-labelledby="help-title" (close)="closed.emit()" (click)="backdrop($event)">
      <div class="help-body">
        <h2 id="help-title">Aiuto e scorciatoie</h2>
        <h3>Come si gioca</h3>
        <p>
          Scegli da 1 a 5 carte dalla mano e giocale, oppure scartale per pescarne di nuove.
          Ogni round ha 4 mani e 3 scarti. Raggiungi l'obiettivo (300, 600, 1000 punti) prima di
          finire le mani. Punteggio: (fiches della combinazione + valore delle carte che la
          formano) × moltiplicatore. I numeri valgono il numero, Fante, Regina e Re valgono 10,
          l'Asso 11.
        </p>
        <p>
          I semi sono Fuoco ▲, Acqua ●, Terra ■, Aria ◆: si riconoscono dalla forma e dal nome,
          non solo dal colore. Puoi tenere fino a {{ maxJokers }} jolly.
        </p>
        <h3>Scorciatoie da tastiera</h3>
        <table>
          <caption class="sr-only">Elenco delle scorciatoie</caption>
          <thead><tr><th scope="col">Tasto</th><th scope="col">Azione</th></tr></thead>
          <tbody>
            @for (s of shortcuts; track s[0]) {
              <tr><th scope="row"><kbd>{{ s[0] }}</kbd></th><td>{{ s[1] }}</td></tr>
            }
          </tbody>
        </table>
        <h3>Combinazioni</h3>
        <table>
          <caption class="sr-only">Fiches e moltiplicatori</caption>
          <thead>
            <tr><th scope="col">Combinazione</th><th scope="col">Fiches</th><th scope="col">Molt.</th></tr>
          </thead>
          <tbody>
            @for (t of order; track t) {
              <tr>
                <th scope="row">{{ table[t].name }}</th>
                <td>{{ table[t].chips }}</td>
                <td>×{{ table[t].mult }}</td>
              </tr>
            }
          </tbody>
        </table>
        <h3>Jolly</h3>
        <ul>
          @for (id of jokerIds; track id) {
            <li><strong>{{ jokers[id].name }}</strong>: {{ jokers[id].description }}</li>
          }
        </ul>
        <button type="button" class="btn btn-primary" (click)="dlg.close()">
          Chiudi <kbd aria-hidden="true">Esc</kbd>
        </button>
      </div>
    </dialog>
  `,
})
export class HelpDialogComponent {
  readonly open = input.required<boolean>();
  readonly closed = output<void>();
  protected readonly shortcuts = SHORTCUTS;
  protected readonly order = HAND_ORDER;
  protected readonly table = HAND_TABLE;
  protected readonly jokers = JOKERS;
  protected readonly jokerIds = JOKER_IDS;
  protected readonly maxJokers = MAX_JOKERS;
  private readonly dlg = viewChild.required<ElementRef<HTMLDialogElement>>('dlg');

  constructor() {
    effect(() => {
      const d = this.dlg().nativeElement;
      if (this.open() && !d.open) d.showModal();
      if (!this.open() && d.open) d.close();
    });
  }

  protected backdrop(e: MouseEvent): void {
    if (e.target === this.dlg().nativeElement) this.dlg().nativeElement.close();
  }
}
