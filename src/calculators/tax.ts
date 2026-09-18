export interface TaxInputs {
  salaryIncome: number
  hasOtherIncome: boolean
  otherIncome: number
  bonus: number
  withholdingTax: number
  socialSecurity: number
  retirementFunds: number
  rmf: number
  thaiEsgX: number
  thaiEsgXFromLtf: number
  thaiEsg: number
  otherDeductions: number
}

export interface TaxBracketRow {
  from: number
  to: number | null
  ratePct: number
  taxableInBracket: number
  taxInBracket: number
}

export interface TaxResult {
  totalIncome: number
  expenseDeduction: number
  personalAllowance: number
  socialSecurityDeduction: number
  retirementFundsDeduction: number
  rmfDeduction: number
  retirementGroupDeduction: number
  thaiEsgXDeduction: number
  thaiEsgXFromLtfDeduction: number
  thaiEsgDeduction: number
  otherDeductions: number
  totalDeductions: number
  taxableIncome: number
  taxDue: number
  additionalTaxToPay: number
  brackets: TaxBracketRow[]
}

export const PERSONAL_ALLOWANCE = 60000
export const EXPENSE_DEDUCTION_RATE = 0.5
export const EXPENSE_DEDUCTION_CAP = 100000
export const SOCIAL_SECURITY_CAP = 10500
export const RETIREMENT_FUNDS_CAP = 500000
export const RMF_CAP = 500000
export const RETIREMENT_GROUP_CAP = 500000
export const ESG_CAP = 300000
export const ESG_INCOME_PCT_CAP = 0.3

const TAX_BRACKETS: { from: number; to: number | null; ratePct: number }[] = [
  { from: 0, to: 150000, ratePct: 0 },
  { from: 150000, to: 300000, ratePct: 5 },
  { from: 300000, to: 500000, ratePct: 10 },
  { from: 500000, to: 750000, ratePct: 15 },
  { from: 750000, to: 1000000, ratePct: 20 },
  { from: 1000000, to: 2000000, ratePct: 25 },
  { from: 2000000, to: 5000000, ratePct: 30 },
  { from: 5000000, to: null, ratePct: 35 },
]

export function calculateTax(inputs: TaxInputs): TaxResult {
  const {
    salaryIncome,
    hasOtherIncome,
    otherIncome,
    bonus,
    withholdingTax,
    socialSecurity,
    retirementFunds,
    rmf,
    thaiEsgX,
    thaiEsgXFromLtf,
    thaiEsg,
    otherDeductions,
  } = inputs

  const otherIncomeUsed = hasOtherIncome ? Math.max(otherIncome, 0) : 0
  const totalIncome = Math.max(0, salaryIncome) + otherIncomeUsed + Math.max(bonus, 0)
  const incomePctCap = totalIncome * ESG_INCOME_PCT_CAP

  const expenseDeduction = Math.min(totalIncome * EXPENSE_DEDUCTION_RATE, EXPENSE_DEDUCTION_CAP)
  const socialSecurityDeduction = Math.min(Math.max(socialSecurity, 0), SOCIAL_SECURITY_CAP)

  // Retirement group: RMF has its own 30%-of-income + 500,000 cap, and when combined
  // with other retirement-group instruments (PVD/กบข/กอช/ประกันบำนาญ) the total is
  // further capped at 500,000 combined.
  const retirementFundsDeduction = Math.min(Math.max(retirementFunds, 0), RETIREMENT_FUNDS_CAP)
  const rmfDeduction = Math.min(Math.max(rmf, 0), RMF_CAP, incomePctCap)
  const retirementGroupDeduction = Math.min(retirementFundsDeduction + rmfDeduction, RETIREMENT_GROUP_CAP)

  const thaiEsgXDeduction = Math.min(Math.max(thaiEsgX, 0), ESG_CAP, incomePctCap)
  const thaiEsgXFromLtfDeduction = Math.min(Math.max(thaiEsgXFromLtf, 0), ESG_CAP, incomePctCap)
  const thaiEsgDeduction = Math.min(Math.max(thaiEsg, 0), ESG_CAP, incomePctCap)
  const otherDeductionsUsed = Math.max(otherDeductions, 0)

  const totalDeductions =
    PERSONAL_ALLOWANCE +
    socialSecurityDeduction +
    retirementGroupDeduction +
    thaiEsgXDeduction +
    thaiEsgXFromLtfDeduction +
    thaiEsgDeduction +
    otherDeductionsUsed

  const taxableIncome = Math.max(0, totalIncome - expenseDeduction - totalDeductions)

  let remaining = taxableIncome
  let taxDue = 0
  const brackets: TaxBracketRow[] = TAX_BRACKETS.map((b) => {
    const bracketSize = b.to === null ? Infinity : b.to - b.from
    const taxableInBracket = Math.max(0, Math.min(remaining, bracketSize))
    const taxInBracket = taxableInBracket * (b.ratePct / 100)
    remaining -= taxableInBracket
    taxDue += taxInBracket
    return { from: b.from, to: b.to, ratePct: b.ratePct, taxableInBracket, taxInBracket }
  })

  const additionalTaxToPay = taxDue - withholdingTax

  return {
    totalIncome,
    expenseDeduction,
    personalAllowance: PERSONAL_ALLOWANCE,
    socialSecurityDeduction,
    retirementFundsDeduction,
    rmfDeduction,
    retirementGroupDeduction,
    thaiEsgXDeduction,
    thaiEsgXFromLtfDeduction,
    thaiEsgDeduction,
    otherDeductions: otherDeductionsUsed,
    totalDeductions,
    taxableIncome,
    taxDue,
    additionalTaxToPay,
    brackets,
  }
}
