import { DEFAULT_SIMULATIONS, gaussianRandom, percentile } from "@/calculators/montecarlo"
import type { DcaInputs } from "@/calculators/dca"

export interface DcaMonteCarloInputs extends DcaInputs {
  volatilityPct: number
  simulations?: number
}

export interface DcaMonteCarloYearPoint {
  [key: string]: number
  year: number
  p10: number
  p50: number
  p90: number
  deposit: number
}

export interface DcaMonteCarloResult {
  yearly: DcaMonteCarloYearPoint[]
  finalValues: number[]
  medianFinal: number
  p10Final: number
  p90Final: number
}

export function runDcaMonteCarlo(inputs: DcaMonteCarloInputs): DcaMonteCarloResult {
  const {
    years,
    initialInvestment,
    annualReturnPct,
    additionalInvestment,
    additionalFrequency,
    additionalGrowthPct,
    additionalGrowthFrequency,
    volatilityPct,
    simulations = DEFAULT_SIMULATIONS,
  } = inputs

  const totalMonths = Math.max(0, Math.round(years * 12))
  const meanMonthlyRate = Math.pow(1 + annualReturnPct / 100, 1 / 12) - 1
  const monthlyStdDev = volatilityPct / 100 / Math.sqrt(12)

  // valuesByYear[y] holds one portfolio value per simulation path at year-end y (1-indexed)
  const valuesByYear: number[][] = Array.from({ length: years }, () => [])
  const finalValues: number[] = []

  for (let sim = 0; sim < simulations; sim++) {
    let portfolioValue = initialInvestment
    let currentAdditional = additionalInvestment

    for (let m = 1; m <= totalMonths; m++) {
      const isContributionMonth =
        additionalFrequency === "monthly" || (additionalFrequency === "annually" && m % 12 === 0)
      if (isContributionMonth && currentAdditional > 0) {
        portfolioValue += currentAdditional
      }

      const monthlyReturn = gaussianRandom(meanMonthlyRate, monthlyStdDev)
      portfolioValue *= 1 + monthlyReturn
      if (portfolioValue < 0) portfolioValue = 0

      const isGrowthMonth =
        additionalGrowthFrequency === "monthly" ||
        (additionalGrowthFrequency === "annually" && m % 12 === 0)
      if (isGrowthMonth) {
        currentAdditional *= 1 + additionalGrowthPct / 100
      }

      if (m % 12 === 0) {
        const y = m / 12
        valuesByYear[y - 1].push(portfolioValue)
      }
    }

    finalValues.push(portfolioValue)
  }

  // Reconstruct the deterministic deposit line for reference in the chart.
  let depositTotal = initialInvestment
  let depositAdditional = additionalInvestment
  const depositByYear: number[] = []
  for (let m = 1; m <= totalMonths; m++) {
    const isContributionMonth =
      additionalFrequency === "monthly" || (additionalFrequency === "annually" && m % 12 === 0)
    if (isContributionMonth && depositAdditional > 0) {
      depositTotal += depositAdditional
    }
    const isGrowthMonth =
      additionalGrowthFrequency === "monthly" || (additionalGrowthFrequency === "annually" && m % 12 === 0)
    if (isGrowthMonth) {
      depositAdditional *= 1 + additionalGrowthPct / 100
    }
    if (m % 12 === 0) depositByYear.push(depositTotal)
  }

  const yearly: DcaMonteCarloYearPoint[] = valuesByYear.map((values, idx) => {
    const sorted = [...values].sort((a, b) => a - b)
    return {
      year: idx + 1,
      p10: percentile(sorted, 0.1),
      p50: percentile(sorted, 0.5),
      p90: percentile(sorted, 0.9),
      deposit: depositByYear[idx] ?? initialInvestment,
    }
  })

  const sortedFinal = [...finalValues].sort((a, b) => a - b)

  return {
    yearly,
    finalValues,
    medianFinal: percentile(sortedFinal, 0.5),
    p10Final: percentile(sortedFinal, 0.1),
    p90Final: percentile(sortedFinal, 0.9),
  }
}
