import { BUCKET_POLICY_DEFAULTS } from "@/calculators/bucket"
import { DEFAULT_SIMULATIONS, gaussianRandom, percentile } from "@/calculators/montecarlo"
import type { BucketInputs, Regime } from "@/calculators/bucket"

export interface BucketMonteCarloInputs extends BucketInputs {
  bondVolatilityPct: number
  growthVolatilityPct: number
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
  bondDepletionProbability: number
  growthDepletionProbability: number
  medianBondDepletedYear: number | null
  medianGrowthDepletedYear: number | null
  insolvencyProbability: number
  medianInsolventYear: number | null
}

const { reserveYears: RESERVE_YEARS, drawdownBadThreshold: DRAWDOWN_BAD_THRESHOLD, bondTolerance: BOND_TOLERANCE } =
  BUCKET_POLICY_DEFAULTS
const DEPLETION_EPSILON = 1

export function runBucketMonteCarlo(inputs: BucketMonteCarloInputs): BucketMonteCarloResult {
  const { safe, passive, bond, growth, spending, bondVolatilityPct, growthVolatilityPct, simulations = DEFAULT_SIMULATIONS } =
    inputs

  const totalYears = Math.max(0, Math.round(spending.years))
  const bondTarget = bond.pv

  const wealthByYear: number[][] = Array.from({ length: totalYears }, () => [])
  const finalValues: number[] = []
  const bondDepletedYears: number[] = []
  const growthDepletedYears: number[] = []
  const insolventYears: number[] = []
  let bondDepletedCount = 0
  let growthDepletedCount = 0
  let insolventCount = 0

  for (let sim = 0; sim < simulations; sim++) {
    let cash = safe.pv
    let bondBalance = bond.pv
    let growthBalance = growth.pv
    let growthPeak = growth.pv
    let bondDepletedYear: number | null = null
    let growthDepletedYear: number | null = null
    let insolventYear: number | null = null

    for (let year = 1; year <= totalYears; year++) {
      const spendingThisYear = spending.monthlySpending * 12 * Math.pow(1 + spending.inflationPct / 100, year - 1)
      const passiveIncomeNet = passive.annualIncome * (1 - passive.taxPct / 100)

      const bondReturn = gaussianRandom(bond.returnPct / 100, bondVolatilityPct / 100)
      const growthReturn = gaussianRandom(growth.returnPct / 100, growthVolatilityPct / 100)

      cash *= 1 + safe.returnPct / 100
      bondBalance *= 1 + bondReturn
      growthBalance *= 1 + growthReturn
      if (bondBalance < 0) bondBalance = 0
      if (growthBalance < 0) growthBalance = 0

      if (growthBalance > growthPeak) growthPeak = growthBalance
      const drawdown = growthPeak > 0 ? (growthPeak - growthBalance) / growthPeak : 0
      const regime: Regime = drawdown > DRAWDOWN_BAD_THRESHOLD ? "bad" : "good"

      cash += passiveIncomeNet - spendingThisYear

      const reserveTarget = spendingThisYear * RESERVE_YEARS

      if (cash < reserveTarget) {
        let shortfall = reserveTarget - cash
        const order: Array<"bond" | "growth"> = regime === "good" ? ["growth", "bond"] : ["bond", "growth"]

        for (const source of order) {
          if (shortfall <= 0) break
          if (source === "growth") {
            const cap = growthBalance * (growth.redemptionToB1Pct / 100)
            const transfer = Math.min(shortfall, cap, growthBalance)
            if (transfer > 0) {
              growthBalance -= transfer
              cash += transfer
              shortfall -= transfer
            }
          } else {
            const cap = bondBalance * (bond.redemptionToB1Pct / 100)
            const transfer = Math.min(shortfall, cap, bondBalance)
            if (transfer > 0) {
              bondBalance -= transfer
              cash += transfer
              shortfall -= transfer
            }
          }
        }

        // Survival override: spending must be covered even beyond the redemption cap.
        if (cash < 0) {
          let emergencyNeed = -cash
          for (const source of order) {
            if (emergencyNeed <= 0) break
            if (source === "growth") {
              const transfer = Math.min(emergencyNeed, growthBalance)
              if (transfer > 0) {
                growthBalance -= transfer
                cash += transfer
                emergencyNeed -= transfer
              }
            } else {
              const transfer = Math.min(emergencyNeed, bondBalance)
              if (transfer > 0) {
                bondBalance -= transfer
                cash += transfer
                emergencyNeed -= transfer
              }
            }
          }
        }
      } else if (regime === "good") {
        if (bondBalance > bondTarget * (1 + BOND_TOLERANCE)) {
          const sweep = bondBalance - bondTarget
          bondBalance -= sweep
          growthBalance += sweep
        } else if (bondBalance < bondTarget * (1 - BOND_TOLERANCE)) {
          const topUp = Math.min(bondTarget - bondBalance, growthBalance)
          bondBalance += topUp
          growthBalance -= topUp
        }
      }

      if (bondBalance < DEPLETION_EPSILON) {
        bondBalance = 0
        if (bondDepletedYear === null) bondDepletedYear = year
      }
      if (growthBalance < DEPLETION_EPSILON) {
        growthBalance = 0
        if (growthDepletedYear === null) growthDepletedYear = year
      }

      if (cash < 0 && insolventYear === null) insolventYear = year
      if (cash < 0) cash = 0

      wealthByYear[year - 1].push(cash + bondBalance + growthBalance)
    }

    finalValues.push(cash + bondBalance + growthBalance)
    if (bondDepletedYear !== null) {
      bondDepletedCount++
      bondDepletedYears.push(bondDepletedYear)
    }
    if (growthDepletedYear !== null) {
      growthDepletedCount++
      growthDepletedYears.push(growthDepletedYear)
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
  const sortedBondDepleted = [...bondDepletedYears].sort((a, b) => a - b)
  const sortedGrowthDepleted = [...growthDepletedYears].sort((a, b) => a - b)
  const sortedInsolvent = [...insolventYears].sort((a, b) => a - b)

  return {
    yearly,
    finalValues,
    medianFinal: percentile(sortedFinal, 0.5),
    p10Final: percentile(sortedFinal, 0.1),
    p90Final: percentile(sortedFinal, 0.9),
    bondDepletionProbability: simulations > 0 ? bondDepletedCount / simulations : 0,
    growthDepletionProbability: simulations > 0 ? growthDepletedCount / simulations : 0,
    medianBondDepletedYear: sortedBondDepleted.length > 0 ? percentile(sortedBondDepleted, 0.5) : null,
    medianGrowthDepletedYear: sortedGrowthDepleted.length > 0 ? percentile(sortedGrowthDepleted, 0.5) : null,
    insolvencyProbability: simulations > 0 ? insolventCount / simulations : 0,
    medianInsolventYear: sortedInsolvent.length > 0 ? percentile(sortedInsolvent, 0.5) : null,
  }
}
