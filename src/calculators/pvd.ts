import { GROWTH_FREQUENCY_MONTHS, type GrowthFrequency } from "@/calculators/frequency"

export type PvdSalaryFrequency = "monthly" | "annually"
export type PvdCompounding = "annually" | "semiannually" | "quarterly" | "monthly" | "none"

const COMPOUND_MONTHS: Record<Exclude<PvdCompounding, "none">, number> = {
  monthly: 1,
  quarterly: 3,
  semiannually: 6,
  annually: 12,
}

export interface PvdInputs {
  currentlySaved: number
  salary: number
  salaryFrequency: PvdSalaryFrequency
  salaryRaisePct: number
  salaryRaiseFrequency: GrowthFrequency
  compounding: PvdCompounding
  contributionPct: number
  employerMatchPct: number
  annualReturnPct: number
  years: number
}

export interface PvdMonthRow {
  month: number
  year: number
  monthInYear: number
  employeeContribution: number
  employerMatch: number
  investmentGain: number
  balance: number
}

export interface PvdResult {
  rows: PvdMonthRow[]
  finalEmployeeContribution: number
  finalEmployerMatch: number
  finalInvestmentGain: number
  finalBalance: number
}

export function calculatePvd(inputs: PvdInputs): PvdResult {
  const {
    currentlySaved,
    salary,
    salaryFrequency,
    salaryRaisePct,
    salaryRaiseFrequency,
    compounding,
    contributionPct,
    employerMatchPct,
    annualReturnPct,
    years,
  } = inputs

  const totalMonths = Math.max(0, Math.round(years * 12))
  let monthlySalary = salaryFrequency === "monthly" ? salary : salary / 12
  const salaryRaiseEveryMonths = GROWTH_FREQUENCY_MONTHS[salaryRaiseFrequency]

  let balance = currentlySaved
  let cumEmployee = 0
  let cumEmployer = 0
  let cumGain = 0

  const periodicRate =
    compounding === "none" ? 0 : annualReturnPct / 100 / (12 / COMPOUND_MONTHS[compounding])

  const rows: PvdMonthRow[] = []

  for (let m = 1; m <= totalMonths; m++) {
    const employeeContribution = monthlySalary * (contributionPct / 100)
    const employerContribution = monthlySalary * (employerMatchPct / 100)

    if (compounding === "none") {
      const gain = balance * (annualReturnPct / 100 / 12)
      balance += gain + employeeContribution + employerContribution
      cumGain += gain
    } else {
      balance += employeeContribution + employerContribution
      const periodMonths = COMPOUND_MONTHS[compounding]
      if (m % periodMonths === 0) {
        const gain = balance * periodicRate
        balance += gain
        cumGain += gain
      }
    }

    cumEmployee += employeeContribution
    cumEmployer += employerContribution

    if (m % salaryRaiseEveryMonths === 0) monthlySalary *= 1 + salaryRaisePct / 100

    rows.push({
      month: m,
      year: Math.ceil(m / 12),
      monthInYear: ((m - 1) % 12) + 1,
      employeeContribution: cumEmployee,
      employerMatch: cumEmployer,
      investmentGain: cumGain,
      balance,
    })
  }

  const last = rows[rows.length - 1]

  return {
    rows,
    finalEmployeeContribution: last?.employeeContribution ?? 0,
    finalEmployerMatch: last?.employerMatch ?? 0,
    finalInvestmentGain: last?.investmentGain ?? 0,
    finalBalance: last?.balance ?? currentlySaved,
  }
}
