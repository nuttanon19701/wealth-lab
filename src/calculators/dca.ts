export type Frequency = "monthly" | "annually"

export interface DcaInputs {
  years: number
  initialInvestment: number
  annualReturnPct: number
  additionalInvestment: number
  additionalFrequency: Frequency
  additionalGrowthPct: number
  additionalGrowthFrequency: Frequency
}

export interface DcaMonthRow {
  month: number
  year: number
  monthInYear: number
  deposit: number
  value: number
  contribution: number
  returnAmount: number
}

export interface DcaResult {
  rows: DcaMonthRow[]
  finalValue: number
  finalContribution: number
  finalReturn: number
}

export function calculateDca(inputs: DcaInputs): DcaResult {
  const {
    years,
    initialInvestment,
    annualReturnPct,
    additionalInvestment,
    additionalFrequency,
    additionalGrowthPct,
    additionalGrowthFrequency,
  } = inputs

  const totalMonths = Math.max(0, Math.round(years * 12))
  const monthlyRate = Math.pow(1 + annualReturnPct / 100, 1 / 12) - 1

  let portfolioValue = initialInvestment
  let totalContribution = initialInvestment
  let currentAdditional = additionalInvestment

  const rows: DcaMonthRow[] = []

  for (let m = 1; m <= totalMonths; m++) {
    let deposit = 0
    const isContributionMonth =
      additionalFrequency === "monthly" || (additionalFrequency === "annually" && m % 12 === 0)

    if (isContributionMonth && currentAdditional > 0) {
      deposit = currentAdditional
      portfolioValue += deposit
      totalContribution += deposit
    }

    portfolioValue *= 1 + monthlyRate

    const isGrowthMonth =
      additionalGrowthFrequency === "monthly" ||
      (additionalGrowthFrequency === "annually" && m % 12 === 0)
    if (isGrowthMonth) {
      currentAdditional *= 1 + additionalGrowthPct / 100
    }

    const year = Math.ceil(m / 12)
    const monthInYear = ((m - 1) % 12) + 1

    rows.push({
      month: m,
      year,
      monthInYear,
      deposit,
      value: portfolioValue,
      contribution: totalContribution,
      returnAmount: portfolioValue - totalContribution,
    })
  }

  const last = rows[rows.length - 1]

  return {
    rows,
    finalValue: last?.value ?? initialInvestment,
    finalContribution: last?.contribution ?? initialInvestment,
    finalReturn: last?.returnAmount ?? 0,
  }
}
