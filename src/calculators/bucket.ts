export interface BucketInputs {
  safe: {
    pv: number
    returnPct: number
  }
  passive: {
    annualIncome: number
    taxPct: number
  }
  lowRisk: {
    pv: number
    returnPct: number
  }
  highRisk: {
    pv: number
    returnPct: number
    redemptionToB2Pct: number
  }
  spending: {
    monthlySpending: number
    inflationPct: number
    years: number
  }
}

export interface BucketYearRow {
  year: number
  spending: number
  passiveIncomeNet: number
  safe: number
  lowRisk: number
  highRisk: number
  totalWealth: number
  sweepLowRiskToSafe: number
  topUpLowRiskFromHighRisk: number
  drawFromLowRisk: number
  drawFromHighRisk: number
  insolvent: boolean
}

export interface BucketResult {
  rows: BucketYearRow[]
  startingWealth: number
  startingProportions: {
    safe: number
    lowRisk: number
    highRisk: number
  }
  lowRiskDepletedYear: number | null
  highRiskDepletedYear: number | null
  insolventYear: number | null
}

const DEPLETION_EPSILON = 1

/**
 * Each year runs in three steps, in this order:
 *
 *  A. Fund spending: Safe absorbs net passive income minus this year's spending.
 *  B. Rebalance Low Risk toward its target level (its own starting PV). If Low
 *     Risk sits above target, the excess sweeps into Safe (which can rescue a
 *     shortfall from step A "for free"). If it sits below target, High Risk
 *     tops it up, capped by High Risk's "redemption to B2" rate.
 *  C. Survival waterfall: if Safe is still negative after A and B, pull
 *     whatever is needed — uncapped — from Low Risk first, then High Risk.
 *     Spending must be covered before any cap or target is honored.
 */
export function calculateBucketStrategy(inputs: BucketInputs): BucketResult {
  const { safe, passive, lowRisk, highRisk, spending } = inputs

  const startingWealth = safe.pv + lowRisk.pv + highRisk.pv
  const startingProportions = {
    safe: startingWealth > 0 ? safe.pv / startingWealth : 0,
    lowRisk: startingWealth > 0 ? lowRisk.pv / startingWealth : 0,
    highRisk: startingWealth > 0 ? highRisk.pv / startingWealth : 0,
  }

  let safeBalance = safe.pv
  let lowRiskBalance = lowRisk.pv
  let highRiskBalance = highRisk.pv
  const lowRiskTarget = lowRisk.pv

  const rows: BucketYearRow[] = []
  let lowRiskDepletedYear: number | null = null
  let highRiskDepletedYear: number | null = null
  let insolventYear: number | null = null

  const totalYears = Math.max(0, Math.round(spending.years))

  for (let year = 1; year <= totalYears; year++) {
    const spendingThisYear = spending.monthlySpending * 12 * Math.pow(1 + spending.inflationPct / 100, year - 1)
    const passiveIncomeNet = passive.annualIncome * (1 - passive.taxPct / 100)

    safeBalance *= 1 + safe.returnPct / 100
    lowRiskBalance *= 1 + lowRisk.returnPct / 100
    highRiskBalance *= 1 + highRisk.returnPct / 100

    // Step A: fund spending from Safe + Passive Income.
    safeBalance += passiveIncomeNet - spendingThisYear

    // Step B: keep Low Risk near its target level.
    let sweepLowRiskToSafe = 0
    let topUpLowRiskFromHighRisk = 0

    if (lowRiskBalance > lowRiskTarget) {
      sweepLowRiskToSafe = lowRiskBalance - lowRiskTarget
      lowRiskBalance -= sweepLowRiskToSafe
      safeBalance += sweepLowRiskToSafe
    } else if (lowRiskBalance < lowRiskTarget) {
      const need = lowRiskTarget - lowRiskBalance
      const cap = highRiskBalance * (highRisk.redemptionToB2Pct / 100)
      topUpLowRiskFromHighRisk = Math.min(need, cap, highRiskBalance)
      lowRiskBalance += topUpLowRiskFromHighRisk
      highRiskBalance -= topUpLowRiskFromHighRisk
    }

    // Step C: survival waterfall — spending must be covered even beyond target/caps.
    let drawFromLowRisk = 0
    let drawFromHighRisk = 0

    if (safeBalance < 0) {
      let need = -safeBalance

      drawFromLowRisk = Math.min(need, lowRiskBalance)
      lowRiskBalance -= drawFromLowRisk
      safeBalance += drawFromLowRisk
      need -= drawFromLowRisk

      if (need > 0) {
        drawFromHighRisk = Math.min(need, highRiskBalance)
        highRiskBalance -= drawFromHighRisk
        safeBalance += drawFromHighRisk
        need -= drawFromHighRisk
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

    const insolvent = safeBalance < 0
    if (insolvent && insolventYear === null) insolventYear = year
    if (safeBalance < 0) safeBalance = 0

    rows.push({
      year,
      spending: spendingThisYear,
      passiveIncomeNet,
      safe: safeBalance,
      lowRisk: lowRiskBalance,
      highRisk: highRiskBalance,
      totalWealth: safeBalance + lowRiskBalance + highRiskBalance,
      sweepLowRiskToSafe,
      topUpLowRiskFromHighRisk,
      drawFromLowRisk,
      drawFromHighRisk,
      insolvent,
    })
  }

  return {
    rows,
    startingWealth,
    startingProportions,
    lowRiskDepletedYear,
    highRiskDepletedYear,
    insolventYear,
  }
}
