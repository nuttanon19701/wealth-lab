import { GROWTH_FREQUENCY_MONTHS, type GrowthFrequency } from "@/calculators/frequency"

export interface RetirementInputs {
  currentAge: number
  retirementAge: number
  targetAge: number
  currentSavings: number
  monthlyIncome: number
  incomeGrowthPct: number
  incomeGrowthFrequency: GrowthFrequency
  monthlyExpense: number
  postRetirementMonthlyExpense: number
  inflationPct: number
  preRetirementReturnPct: number
  postRetirementReturnPct: number
}

export interface RetirementMonthRow {
  month: number
  year: number
  monthInYear: number
  age: number
  income: number
  expense: number
  asset: number
}

export interface RetirementResult {
  rows: RetirementMonthRow[]
  assetAtRetirement: number
  depletedAge: number | null
  finalAsset: number
}

export function calculateRetirement(inputs: RetirementInputs): RetirementResult {
  const {
    currentAge,
    retirementAge,
    targetAge,
    currentSavings,
    monthlyIncome,
    incomeGrowthPct,
    incomeGrowthFrequency,
    monthlyExpense,
    postRetirementMonthlyExpense,
    inflationPct,
    preRetirementReturnPct,
    postRetirementReturnPct,
  } = inputs

  const totalMonths = Math.max(0, Math.round((targetAge - currentAge) * 12))
  const retirementMonth = Math.max(0, Math.round((retirementAge - currentAge) * 12))

  const preMonthlyReturn = Math.pow(1 + preRetirementReturnPct / 100, 1 / 12) - 1
  const postMonthlyReturn = Math.pow(1 + postRetirementReturnPct / 100, 1 / 12) - 1
  const monthlyInflation = Math.pow(1 + inflationPct / 100, 1 / 12) - 1
  const incomeGrowthEveryMonths = GROWTH_FREQUENCY_MONTHS[incomeGrowthFrequency]

  let asset = currentSavings
  let currentIncome = monthlyIncome
  let currentPreExpense = monthlyExpense
  let currentPostExpense = postRetirementMonthlyExpense
  let assetAtRetirement = currentSavings
  let depletedAge: number | null = null

  const rows: RetirementMonthRow[] = []

  for (let m = 1; m <= totalMonths; m++) {
    const isRetired = m > retirementMonth
    const income = isRetired ? 0 : currentIncome
    const expense = isRetired ? currentPostExpense : currentPreExpense
    const monthlyReturn = isRetired ? postMonthlyReturn : preMonthlyReturn

    asset = asset * (1 + monthlyReturn) + income - expense
    if (asset < 0) asset = 0

    if (!isRetired && m % incomeGrowthEveryMonths === 0) {
      currentIncome *= 1 + incomeGrowthPct / 100
    }
    currentPreExpense *= 1 + monthlyInflation
    currentPostExpense *= 1 + monthlyInflation

    if (m === retirementMonth) assetAtRetirement = asset
    if (isRetired && asset <= 0 && depletedAge === null) {
      depletedAge = currentAge + m / 12
    }

    const year = Math.ceil(m / 12)
    const monthInYear = ((m - 1) % 12) + 1

    rows.push({
      month: m,
      year,
      monthInYear,
      age: currentAge + m / 12,
      income,
      expense,
      asset,
    })
  }

  return {
    rows,
    assetAtRetirement,
    depletedAge,
    finalAsset: rows[rows.length - 1]?.asset ?? currentSavings,
  }
}
