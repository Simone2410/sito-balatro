# Regole di Alambicco

- Mazzo francese da 52 carte, con semi Fuoco ▲, Acqua ●, Terra ■, Aria ◆. Mazzo nuovo a ogni round.
- 8 carte in mano; si selezionano da 1 a 5 carte.
- Ogni round: 4 mani e 3 scarti. Scartare sostituisce le carte con nuove pescate.
- Round: 3, con obiettivi 300, 600 e 1000 punti. Mani finite sotto obiettivo = partita persa.
- Valore carte: numeri = numero, Fante/Regina/Re = 10, Asso = 11.
- Punteggio: (fiches della combinazione + valore delle carte che la formano) × moltiplicatore.
  Contano solo le carte che formano la combinazione (carta alta: solo la più alta).

| Combinazione | Fiches | Molt. |
|---|---|---|
| Carta alta | 5 | 1 |
| Coppia | 10 | 2 |
| Doppia coppia | 20 | 2 |
| Tris | 30 | 3 |
| Scala | 30 | 4 |
| Colore | 35 | 4 |
| Full | 40 | 4 |
| Poker | 60 | 7 |
| Scala colore | 100 | 8 |

Scala e Colore richiedono 5 carte; l'Asso vale alto o basso (A-2-3-4-5).

## Estensioni
- **Jolly** (fino a 5), applicati in ordine dopo il punteggio base:
  Sale Filosofale (+30 fiches), Mercurio Vivo (+4 molt.), Fornace Ardente (+3 molt. per carta di Fuoco che segna),
  Bilancia del Mago (+15 fiches per figura che segna), Specchio Gemello (molt. ×2 su Coppia, Doppia coppia, Full).
- **Negozio** dopo i round 1 e 2: 3 jolly casuali non posseduti. Guadagno a fine round: 5 monete + 1 per ogni mano rimasta. Si parte con 4 monete.
- **Salvataggio** automatico in `localStorage`; la partita riprende alla riapertura.
- **Ordinamento**: tasto O alterna valore e seme.
