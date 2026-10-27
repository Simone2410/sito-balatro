# Alambicco
## Stack
- Angular 22 (standalone, signals) + Angular CLI (builder `@angular/build`, basato su Vite/esbuild)
- TypeScript strict, Vitest per i test (`npm test`)
- PWA con `@angular/service-worker` (`ngsw-config.json`)
- Nessun meta-framework (niente SSR), pubblicazione su Vercel
## Gioco
- Gioco di carte a turni ispirato alle meccaniche di Balatro, tema alchemico (semi: Fuoco, Acqua, Terra, Aria)
- Regole complete in `docs/regole.md`
- Logica pura in `src/game/` (nessun import da Angular); UI in `src/app/`
- Stato unico in `GameStore` (signal) che chiama il `reducer` di `src/game/state.ts`
## Regole
- Tutto giocabile da tastiera, focus sempre visibile e mai perso dopo giocata/scarto/negozio
- Pattern ARIA secondo le WAI-ARIA Authoring Practices (listbox, dialog, live region)
- Pulsanti che si disattivano usano `aria-disabled`, mai `disabled` (il focus non deve sparire)
- Nessuna nuova dipendenza senza chiedere
