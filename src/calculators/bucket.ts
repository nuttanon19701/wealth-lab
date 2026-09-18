export type Regime = "good" | "bad"

export interface BucketInputs {
  safe: {
    pv: number
    returnPct: number
  }
  passive: {
    annualIncome: number
    taxPct: number
  }
  bond: {
    pv: number
    returnPct: number
    redemptionToB1Pct: number
  }
  growth: {
    pv: number
    returnPct: number
    redemptionToB1Pct: number
  }
  spending: {
    monthlySpending: number
    inflationPct: number
    years: number
  }
}

export interface BucketYearRow {
  year: number
  regime: Regime
  spending: number
  passiveIncomeNet: number
  cash: number
  bond: number
  growth: number
  totalWealth: number
  refillFromGrowth: number
  refillFromBond: number
  sweepBondToGrowth: number
  topUpBondFromGrowth: number
  unmetShortfall: number
  emergencyWithdrawal: number
  insolvent: boolean
}

export interface BucketResult {
  rows: BucketYearRow[]
  startingWealth: number
  startingProportions: {
    safe: number
    bond: number
    growth: number
  }
  bondDepletedYear: number | null
  growthDepletedYear: number | null
  insolventYear: number | null
}

// Default policy assumptions (documented for the reader in the UI):
const RESERVE_YEARS = 1 // Bucket 1 target reserve = N years of net spending
const DRAWDOWN_BAD_THRESHOLD = 0.15 // >15% drawdown from the growth bucket's peak => "bad" regime
const BOND_TOLERANCE = 0.1 // +/-10% band around the bond bucket's target level
const DEPLETION_EPSILON = 1

export function calculateBucketStrategy(inputs: BucketInputs): BucketResult {
  const { safe, passive, bond, growth, spending } = inputs

  const startingWealth = safe.pv + bond.pv + growth.pv
  const startingProportions = {
    safe: startingWealth > 0 ? safe.pv / startingWealth : 0,
    bond: startingWealth > 0 ? bond.pv / startingWealth : 0,
    growth: startingWealth > 0 ? growth.pv / startingWealth : 0,
  }

  let cash = safe.pv
  let bondBalance = bond.pv
  let growthBalance = growth.pv
  let growthPeak = growth.pv

  const bondTarget = bond.pv

  const rows: BucketYearRow[] = []
  let bondDepletedYear: number | null = null
  let growthDepletedYear: number | null = null
  let insolventYear: number | null = null

  const totalYears = Math.max(0, Math.round(spending.years))

  for (let year = 1; year <= totalYears; year++) {
    const spendingThisYear = spending.monthlySpending * 12 * Math.pow(1 + spending.inflationPct / 100, year - 1)
    const passiveIncomeNet = passive.annualIncome * (1 - passive.taxPct / 100)

    cash *= 1 + safe.returnPct / 100
    bondBalance *= 1 + bond.returnPct / 100
    growthBalance *= 1 + growth.returnPct / 100

    if (growthBalance > growthPeak) growthPeak = growthBalance
    const drawdown = growthPeak > 0 ? (growthPeak - growthBalance) / growthPeak : 0
    const regime: Regime = drawdown > DRAWDOWN_BAD_THRESHOLD ? "bad" : "good"

    cash += passiveIncomeNet - spendingThisYear

    let refillFromGrowth = 0
    let refillFromBond = 0
    let sweepBondToGrowth = 0
    let topUpBondFromGrowth = 0
    let unmetShortfall = 0
    let emergencyWithdrawal = 0

    const reserveTarget = spendingThisYear * RESERVE_YEARS

    if (cash < reserveTarget) {
      let shortfall = reserveTarget - cash
      const order: Array<"bond" | "growth"> = regime === "good" ? ["growth", "bond"] : ["bond", "growth"]

      // Phase 1: normal, capped refill toward the reserve target (protects buckets
      // from over-withdrawal under ordinary conditions).
      for (const source of order) {
        if (shortfall <= 0) break
        if (source === "growth") {
          const cap = growthBalance * (growth.redemptionToB1Pct / 100)
          const transfer = Math.min(shortfall, cap, growthBalance)
          if (transfer > 0) {
            growthBalance -= transfer
            cash += transfer
            shortfall -= transfer
            refillFromGrowth += transfer
          }
        } else {
          const cap = bondBalance * (bond.redemptionToB1Pct / 100)
          const transfer = Math.min(shortfall, cap, bondBalance)
          if (transfer > 0) {
            bondBalance -= transfer
            cash += transfer
            shortfall -= transfer
            refillFromBond += transfer
          }
        }
      }

      unmetShortfall = Math.max(shortfall, 0)

      // Phase 2: survival override. If the capped refill still leaves this year's
      // spending uncovered (cash below zero, not just below the reserve target),
      // pull whatever is still needed beyond the cap — spending must be met first.
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
              refillFromGrowth += transfer
              emergencyWithdrawal += transfer
            }
          } else {
            const transfer = Math.min(emergencyNeed, bondBalance)
            if (transfer > 0) {
              bondBalance -= transfer
              cash += transfer
              emergencyNeed -= transfer
              refillFromBond += transfer
              emergencyWithdrawal += transfer
            }
          }
        }
      }
    } else if (regime === "good") {
      if (bondBalance > bondTarget * (1 + BOND_TOLERANCE)) {
        sweepBondToGrowth = bondBalance - bondTarget
        bondBalance -= sweepBondToGrowth
        growthBalance += sweepBondToGrowth
      } else if (bondBalance < bondTarget * (1 - BOND_TOLERANCE)) {
        topUpBondFromGrowth = Math.min(bondTarget - bondBalance, growthBalance)
        bondBalance += topUpBondFromGrowth
        growthBalance -= topUpBondFromGrowth
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

    // True insolvency: even the uncapped emergency withdrawal (Phase 2) couldn't
    // cover this year's spending because both buckets are fully drained.
    const insolvent = cash < 0
    if (insolvent && insolventYear === null) insolventYear = year
    if (cash < 0) cash = 0

    rows.push({
      year,
      regime,
      spending: spendingThisYear,
      passiveIncomeNet,
      cash,
      bond: bondBalance,
      growth: growthBalance,
      totalWealth: cash + bondBalance + growthBalance,
      refillFromGrowth,
      refillFromBond,
      sweepBondToGrowth,
      topUpBondFromGrowth,
      unmetShortfall,
      emergencyWithdrawal,
      insolvent,
    })
  }

  return {
    rows,
    startingWealth,
    startingProportions,
    bondDepletedYear,
    growthDepletedYear,
    insolventYear,
  }
}

export const BUCKET_POLICY_DEFAULTS = {
  reserveYears: RESERVE_YEARS,
  drawdownBadThreshold: DRAWDOWN_BAD_THRESHOLD,
  bondTolerance: BOND_TOLERANCE,
}
