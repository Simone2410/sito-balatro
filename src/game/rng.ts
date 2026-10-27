// PRNG deterministico (mulberry32): lo stato di gioco resta una funzione pura del seed.
export function nextRandom(seed: number): [number, number] {
  const s = (seed + 0x6d2b79f5) >>> 0
  let t = s
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, s]
}

export function shuffle<T>(items: readonly T[], seed: number): [T[], number] {
  const out = [...items]
  let s = seed
  for (let i = out.length - 1; i > 0; i--) {
    const [r, next] = nextRandom(s)
    s = next
    const j = Math.floor(r * (i + 1))
    const tmp = out[i]
    out[i] = out[j]
    out[j] = tmp
  }
  return [out, s]
}
