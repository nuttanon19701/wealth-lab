export type CompoundingFrequency =
  | "annually"
  | "semiannually"
  | "quarterly"
  | "monthly"
  | "semimonthly"
  | "biweekly"
  | "weekly"
  | "daily"

export const PERIODS_PER_YEAR: Record<CompoundingFrequency, number> = {
  annually: 1,
  semiannually: 2,
  quarterly: 4,
  monthly: 12,
  semimonthly: 24,
  biweekly: 26,
  weekly: 52,
  daily: 365,
}

export type RateMode = "nominal" | "effective"
export type TimingMode = "end" | "begin"
export type TvmField = "pv" | "pmt" | "fv" | "rate" | "period"

export interface TvmSettings {
  rateMode: RateMode
  timingMode: TimingMode
  compounding: CompoundingFrequency
}

export interface TvmValues {
  pv: number
  pmt: number
  fv: number
  ratePct: number
  periods: number
}

function periodicRate(annualRatePct: number, settings: TvmSettings): number {
  const m = PERIODS_PER_YEAR[settings.compounding]
  const r = annualRatePct / 100
  if (settings.rateMode === "nominal") return r / m
  return Math.pow(1 + r, 1 / m) - 1
}

function annualRateFromPeriodic(i: number, settings: TvmSettings): number {
  const m = PERIODS_PER_YEAR[settings.compounding]
  if (settings.rateMode === "nominal") return i * m * 100
  return (Math.pow(1 + i, m) - 1) * 100
}

function typeFactor(settings: TvmSettings): number {
  return settings.timingMode === "begin" ? 1 : 0
}

function tvmResidual(i: number, type: number, pv: number, pmt: number, fv: number, N: number): number {
  if (Math.abs(i) < 1e-12) return pv + pmt * N + fv
  return pv + pmt * (1 + i * type) * (1 - Math.pow(1 + i, -N)) / i + fv * Math.pow(1 + i, -N)
}

function bisectRefine(f: (x: number) => number, a: number, b: number, fa: number): number {
  let lo = a
  let hi = b
  let fLo = fa
  for (let iter = 0; iter < 100; iter++) {
    const mid = (lo + hi) / 2
    const fm = f(mid)
    if (Math.abs(fm) < 1e-9) return mid
    if ((fLo < 0 && fm < 0) || (fLo > 0 && fm > 0)) {
      lo = mid
      fLo = fm
    } else {
      hi = mid
    }
  }
  return (lo + hi) / 2
}

// Searches outward from i=0 in both directions with a geometrically growing step,
// so the economically meaningful root near zero is found before the numerically
// wild region near the i -> -1 asymptote (where (1+i)^-N blows up).
function bisectionSolve(f: (x: number) => number, maxRate = 10, minRate = -0.999): number | null {
  const f0 = f(0)
  if (Math.abs(f0) < 1e-9) return 0

  let x = 0
  let y = f0
  let step = 0.0005
  while (x < maxRate) {
    const nx = Math.min(maxRate, x + step)
    const ny = f(nx)
    if (Number.isFinite(ny) && Number.isFinite(y) && y * ny <= 0) {
      return bisectRefine(f, x, nx, y)
    }
    if (nx === maxRate) break
    x = nx
    y = ny
    step *= 1.05
  }

  x = 0
  y = f0
  step = 0.0005
  while (x > minRate) {
    const nx = Math.max(minRate, x - step)
    const ny = f(nx)
    if (Number.isFinite(ny) && Number.isFinite(y) && y * ny <= 0) {
      return bisectRefine(f, nx, x, ny)
    }
    if (nx === minRate) break
    x = nx
    y = ny
    step *= 1.05
  }

  return null
}

export function solveTvm(field: TvmField, values: TvmValues, settings: TvmSettings): number {
  const { pv, pmt, fv, ratePct, periods: N } = values
  const type = typeFactor(settings)

  switch (field) {
    case "pv": {
      const i = periodicRate(ratePct, settings)
      if (i === 0) return -(pmt * N + fv)
      return -(pmt * (1 + i * type) * (1 - Math.pow(1 + i, -N)) / i + fv * Math.pow(1 + i, -N))
    }
    case "fv": {
      const i = periodicRate(ratePct, settings)
      if (i === 0) return -(pv + pmt * N)
      return -(pv + (pmt * (1 + i * type) * (1 - Math.pow(1 + i, -N))) / i) * Math.pow(1 + i, N)
    }
    case "pmt": {
      const i = periodicRate(ratePct, settings)
      if (i === 0) return -(pv + fv) / N
      const annuityFactor = ((1 + i * type) * (1 - Math.pow(1 + i, -N))) / i
      return -(pv + fv * Math.pow(1 + i, -N)) / annuityFactor
    }
    case "period": {
      const i = periodicRate(ratePct, settings)
      if (i === 0) return -(pv + fv) / pmt
      const A = (pmt * (1 + i * type)) / i
      const ratio = -(pv + A) / (fv - A)
      if (ratio <= 0) return NaN
      return -Math.log(ratio) / Math.log(1 + i)
    }
    case "rate": {
      const i = bisectionSolve((x) => tvmResidual(x, type, pv, pmt, fv, N))
      if (i === null) return NaN
      return annualRateFromPeriodic(i, settings)
    }
    default:
      return NaN
  }
}
