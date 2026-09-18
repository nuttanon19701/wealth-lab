import { DEFAULT_SIMULATIONS, gaussianRandom, percentile } from "@/calculators/montecarlo"
import type { BucketInputs } from "@/calculators/bucket"

export interface BucketMonteCarloInputs extends BucketInputs {
  lowRiskVolatilityPct: number
  highRiskVolatilityPct: number
  simulations?: number
}

export interface BucketMonteCarloYearPoint {
  [key: string]: number
  year: number
  p10: number
  p50: number
  p90: number
}

export interface BucketMonteCarloResult {
  yearly: BucketMonteCarloYearPoint[]
  finalValues: number[]
  medianFinal: number
  p10Final: number
  p90Final: number
  lowRiskDepletionProbability: number
  highRiskDepletionProbability: number
  medianLowRiskDepletedYear: number | null
  medianHighRiskDepletedYear: number | null
  insolvencyProbability: number
  medianInsolventYear: number | null
}

const DEPLETION_EPSILON = 1

export function runBucketMonteCarlo(inputs: BucketMonteCarloInputs): BucketMonteCarloResult {
  const {
    safe,
    passive,
    lowRisk,
    highRisk,
    spending,
    lowRiskVolatilityPct,
    highRiskVolatilityPct,
    simulations = DEFAULT_SIMULATIONS,
  } = inputs

  const totalYears = Math.max(0, Math.round(spending.years))
  const lowRiskTarget = lowRisk.pv

  const wealthByYear: number[][] = Array.from({ length: totalYears }, () => [])
  const finalValues: number[] = []
  const lowRiskDepletedYears: number[] = []
  const highRiskDepletedYears: number[] = []
  const insolventYears: number[] = []
  let lowRiskDepletedCount = 0
  let highRiskDepletedCount = 0
  let insolventCount = 0

  for (let sim = 0; sim < simulations; sim++) {
    let safeBalance = safe.pv
    let lowRiskBalance = lowRisk.pv
    let highRiskBalance = highRisk.pv
    let lowRiskDepletedYear: number | null = null
    let highRiskDepletedYear: number | null = null
    let insolventYear: number | null = null

    for (let year = 1; year <= totalYears; year++) {
      const spendingThisYear = spending.monthlySpending * 12 * Math.pow(1 + spending.inflationPct / 100, year - 1)
      const passiveIncomeNet = passive.annualIncome * (1 - passive.taxPct / 100)

      const lowRiskReturn = gaussianRandom(lowRisk.returnPct / 100, lowRiskVolatilityPct / 100)
      const highRiskReturn = gaussianRandom(highRisk.returnPct / 100, highRiskVolatilityPct / 100)

      safeBalance *= 1 + safe.returnPct / 100
      lowRiskBalance *= 1 + lowRiskReturn
      highRiskBalance *= 1 + highRiskReturn
      if (lowRiskBalance < 0) lowRiskBalance = 0
      if (highRiskBalance < 0) highRiskBalance = 0

      safeBalance += passiveIncomeNet - spendingThisYear

      if (lowRiskBalance > lowRiskTarget) {
        const sweep = lowRiskBalance - lowRiskTarget
        lowRiskBalance -= sweep
        safeBalance += sweep
      } else if (lowRiskBalance < lowRiskTarget) {
        const need = lowRiskTarget - lowRiskBalance
        const cap = highRiskBalance * (highRisk.redemptionToB2Pct / 100)
        const topUp = Math.min(need, cap, highRiskBalance)
        lowRiskBalance += topUp
        highRiskBalance -= topUp
      }

      if (safeBalance < 0) {
        let need = -safeBalance

        const fromLowRisk = Math.min(need, lowRiskBalance)
        lowRiskBalance -= fromLowRisk
        safeBalance += fromLowRisk
        need -= fromLowRisk

        if (need > 0) {
          const fromHighRisk = Math.min(need, highRiskBalance)
          highRiskBalance -= fromHighRisk
          safeBalance += fromHighRisk
          need -= fromHighRisk
        }
      }

      if (lowRiskBalance < DEPLETION_EPSILON) {
        lowRiskBalance = 0
        if (lowRiskDepletedYear === null) lowRiskDepletedYear = year
      }
      if (highRiskBalance < DEPLETION_EPSILON) {
        highRiskBalance = 0
        if (highRiskDepletedYear === null) highRiskDepletedYear = year
      }

      if (safeBalance < 0 && insolventYear === null) insolventYear = year
      if (safeBalance < 0) safeBalance = 0

      wealthByYear[year - 1].push(safeBalance + lowRiskBalance + highRiskBalance)
    }

    finalValues.push(safeBalance + lowRiskBalance + highRiskBalance)
    if (lowRiskDepletedYear !== null) {
      lowRiskDepletedCount++
      lowRiskDepletedYears.push(lowRiskDepletedYear)
    }
    if (highRiskDepletedYear !== null) {
      highRiskDepletedCount++
      highRiskDepletedYears.push(highRiskDepletedYear)
    }
    if (insolventYear !== null) {
      insolventCount++
      insolventYears.push(insolventYear)
    }
  }

  const yearly: BucketMonteCarloYearPoint[] = wealthByYear.map((values, idx) => {
    const sorted = [...values].sort((a, b) => a - b)
    return {
      year: idx + 1,
      p10: percentile(sorted, 0.1),
      p50: percentile(sorted, 0.5),
      p90: percentile(sorted, 0.9),
    }
  })

  const sortedFinal = [...finalValues].sort((a, b) => a - b)
  const sortedLowRiskDepleted = [...lowRiskDepletedYears].sort((a, b) => a - b)
  const sortedHighRiskDepleted = [...highRiskDepletedYears].sort((a, b) => a - b)
  const sortedInsolvent = [...insolventYears].sort((a, b) => a - b)

  return {
    yearly,
    finalValues,
    medianFinal: percentile(sortedFinal, 0.5),
    p10Final: percentile(sortedFinal, 0.1),
    p90Final: percentile(sortedFinal, 0.9),
    lowRiskDepletionProbability: simulations > 0 ? lowRiskDepletedCount / simulations : 0,
    highRiskDepletionProbability: simulations > 0 ? highRiskDepletedCount / simulations : 0,
    medianLowRiskDepletedYear: sortedLowRiskDepleted.length > 0 ? percentile(sortedLowRiskDepleted, 0.5) : null,
    medianHighRiskDepletedYear: sortedHighRiskDepleted.length > 0 ? percentile(sortedHighRiskDepleted, 0.5) : null,
    insolvencyProbability: simulations > 0 ? insolventCount / simulations : 0,
    medianInsolventYear: sortedInsolvent.length > 0 ? percentile(sortedInsolvent, 0.5) : null,
  }
}
