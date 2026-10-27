import {
  Component, ElementRef, Injector, afterNextRender, computed, effect, inject, input, output,
  signal, viewChildren,
} from '@angular/core';
import type { Card } from '../game/types';
import { CardComponent } from './card';

@Component({
  selector: 'app-hand',
  imports: [CardComponent],
  host: {
    class: 'hand',
    role: 'listbox',
    'aria-multiselectable': 'true',
    'aria-orientation': 'horizontal',
    '[attr.aria-label]': 'label()',
    '(keydown)': 'onKeydown($event)',
  },
  template: `
    @for (card of hand(); track card.id; let i = $index) {
      <app-card
        [card]="card"
        [index]="i"
        [selected]="selected().includes(card.id)"
        [tabIndex]="i === activeIndex() ? 0 : -1"
        (focused)="onFocused(card.id, i)"
        (toggled)="onClicked(card.id, i)"
      />
    }
  `,
})
export class HandComponent {
  readonly hand = input.required<Card[]>();
  readonly selected = input.required<string[]>();
  /** Cambia quando il focus va riportato sulla mano (giocata, scarto, ordinamento, nuovo round). */
  readonly focusSignal = input.required<number>();
  readonly toggle = output<string>();
  readonly play = output<void>();

  private readonly focusIdx = signal(0);
  private focusedId: string | null = null;
  private readonly cards = viewChildren(CardComponent, { read: ElementRef });
  private readonly injector = inject(Injector);

  protected readonly label = computed(() => `La tua mano, ${this.hand().length} carte`);
  protected readonly activeIndex = computed(() =>
    Math.min(this.focusIdx(), Math.max(this.hand().length - 1, 0)),
  );

  constructor() {
    // Dopo un'azione le carte cambiano o spariscono: il focus va su un punto sensato
    // (la stessa carta se esiste ancora, altrimenti la posizione più vicina).
    // Se il focus è su un pulsante, resta lì.
    effect(() => {
      this.focusSignal();
      afterNextRender(() => this.restoreFocus(), { injector: this.injector });
    });
  }

  private restoreFocus(): void {
    const active = document.activeElement;
    const lost = !active || active === document.body;
    const inHand = !!active && !!active.closest('[role="listbox"]');
    if (!lost && !inHand) return;
    const hand = this.hand();
    if (hand.length === 0) return;
    const kept = this.focusedId ? hand.findIndex((c) => c.id === this.focusedId) : -1;
    const pos = kept >= 0 ? kept : Math.min(this.focusIdx(), hand.length - 1);
    this.focusIdx.set(pos);
    this.cards()[pos]?.nativeElement.focus();
  }

  protected onFocused(id: string, i: number): void {
    this.focusedId = id;
    this.focusIdx.set(i);
  }

  protected onClicked(id: string, i: number): void {
    this.focusIdx.set(i);
    this.toggle.emit(id);
  }

  private focusAt(i: number): void {
    const pos = Math.max(0, Math.min(this.hand().length - 1, i));
    this.focusIdx.set(pos);
    this.cards()[pos]?.nativeElement.focus();
  }

  protected onKeydown(e: KeyboardEvent): void {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const i = this.activeIndex();
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        this.focusAt(i + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        this.focusAt(i - 1);
        break;
      case 'Home':
        e.preventDefault();
        this.focusAt(0);
        break;
      case 'End':
        e.preventDefault();
        this.focusAt(this.hand().length - 1);
        break;
      case ' ':
        e.preventDefault();
        this.toggle.emit(this.hand()[i].id);
        break;
      case 'Enter':
        e.preventDefault();
        this.play.emit();
        break;
    }
  }
}
