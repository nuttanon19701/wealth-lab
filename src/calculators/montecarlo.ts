// Box-Muller transform for a standard-normal-distributed random draw.
export function gaussianRandom(mean = 0, stdDev = 1): number {
  let u = 0
  let v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  return mean + z * stdDev
}

export function percentile(sortedAscending: number[], p: number): number {
  if (sortedAscending.length === 0) return 0
  const idx = (sortedAscending.length - 1) * p
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  if (lo === hi) return sortedAscending[lo]
  return sortedAscending[lo] + (sortedAscending[hi] - sortedAscending[lo]) * (idx - lo)
}

export const DEFAULT_SIMULATIONS = 500
