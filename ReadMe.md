# Alambicco

Gioco di carte alchemico ispirato alle meccaniche di Balatro, ma con identità propria: semi Fuoco/Acqua/Terra/Aria, jolly alchemici, grafica e testi originali. Giocabile solo da tastiera, usabile da 360px, installabile come PWA e funzionante offline.

> Nota sullo stack: la traccia del PDF indica React + Vite. Per scelta esplicita dello studente il progetto è stato realizzato con **Angular**.

## Avvio in locale

```bash
npm install
npm start        # http://localhost:4200
npm test         # test della logica di gioco
npm run build    # build di produzione (con service worker) in dist/alambicco/browser
```

Il service worker è attivo solo nella build di produzione. Per provare PWA e offline: `npm run build` e servire `dist/alambicco/browser` con un server statico (es. `npx http-server dist/alambicco/browser -p 8080 -c-1`).

## Pubblicazione su Vercel

1. Crea un repository GitHub e fai push (`git remote add origin ...`, `git push -u origin main`).
2. Su vercel.com: *Add New → Project*, importa il repository.
3. Vercel legge `vercel.json` (build `npm run build`, output `dist/alambicco/browser`). Framework preset: *Other*.
4. Ogni push su `main` ripubblica. `vercel.json` imposta `no-cache` su `ngsw.json`, `ngsw-worker.js` e manifest, così dopo un deploy i client rilevano la nuova versione.

## Comandi da tastiera

| Tasto | Azione |
|---|---|
| ← → | Muoversi tra le carte o tra i pulsanti di una riga |
| ↑ ↓ | Passare tra le righe (Aiuto/Nuova partita, mano, Gioca/Scarta/Ordina) |
| Home, Fine | Prima / ultima carta |
| P | Nuova partita (con conferma) |
| Spazio | Seleziona / deseleziona la carta |
| 1–8 | Seleziona la carta in quella posizione |
| G o Invio | Gioca |
| S | Scarta |
| O | Ordina (alterna valore / seme) |
| A | Rilegge lo stato della partita |
| ? / Esc | Apre / chiude l'aiuto |
| Negozio: 1–3, N | Compra / prossimo round |
| Fine partita: N | Nuova partita |

## Struttura

```
src/game/    logica pura (mazzo, combinazioni, punteggio, jolly, reducer, salvataggio) + test
src/app/     componenti Angular: hand, card, hud, joker-bar, result-panel, shop, end-screen, help-dialog, GameStore
public/      icone PWA e manifest
docs/regole.md   regole complete
ngsw-config.json configurazione del service worker
```

## Accessibilità

- Mano come `listbox` con `option` per carta; etichetta tipo "Regina di Fuoco, selezionata". Focus con movimento a frecce (roving tabindex).
- Seme comunicato da simbolo, nome e colore. Selezione comunicata da rialzo, bordo doppio e spunta.
- Annuncio dopo ogni mano (live region `role="status"`): combinazione, punti, punti mancanti. Annunciati anche scarti, acquisti, round, aiuto aggiornamenti.
- Dopo giocata/scarto/ordinamento il focus torna sulla mano (stessa carta o posizione più vicina); aprendo il negozio va sul titolo; l'aiuto usa `<dialog>` nativo e restituisce il focus alla chiusura.
- Le frecce raggiungono tutti i pulsanti (righe `data-nav-row`). Ogni pulsante ha una descrizione vocale (`aria-describedby`) con tasto e stato, es. "Pulsante Gioca. Premi Invio, Spazio o il tasto G per giocarle".
- Pulsanti non disponibili con `aria-disabled` (il focus non si perde).
- Colori con contrasto AA, `prefers-reduced-motion` rispettato, nessuna info solo in hover, aree toccabili ≥ 44px.

## Dipendenze

- `@angular/*`, `rxjs`, `tslib`: framework (scelto dallo studente).
- `@angular/service-worker`: PWA, cache offline e aggiornamento dopo i deploy (con banner "Aggiorna ora").
- `vitest` (incluso con Angular CLI): test della logica.

Nessuna libreria di UI o di stato: lo stato è un `signal` che usa un reducer puro.

## Blocco di contesto usato con l'AI

Vedi [CLAUDE.md](CLAUDE.md).

## Fonti consultate

- W3C WAI-ARIA Authoring Practices Guide: pattern Listbox, Dialog (Modal), Live regions.
- WCAG 2.2 (contrasto 1.4.3, dimensione target 2.5.8, focus visibile 2.4.7).
- Documentazione Angular: signals, `@angular/service-worker`.
- Regole del gioco originale (Balatro), solo per le meccaniche.

## Diario dell'AI

- Il PDF non era leggibile con lo strumento di lettura PDF; si è usato `pdftotext`. Si è notato dal messaggio d'errore.
- Primo scaffold in React (come da PDF); lo studente ha poi chiesto Angular: logica in `src/game/` riutilizzata, UI riscritta.
- Un comando shell con heredoc lunghi è fallito per errore di quoting: nessun file creato, notato dall'errore, rifatto con file singoli.
- Uno script di riordino del template ha danneggiato `app.ts`: notato perché mancavano `app-joker-bar`/`app-result-panel` al `grep`, riparato a mano.
- `?` da tastiera simulata dagli strumenti non apriva l'aiuto; verificato con evento sintetico `?` (il comportamento reale va provato a mano).

## Da verificare a mano

- Lighthouse (PWA, accessibilità) e axe DevTools sulla build pubblicata.
- Prova con NVDA, installazione PWA e uso offline, aggiornamento dopo un secondo deploy.
- Prova finale a mouse scollegato.
