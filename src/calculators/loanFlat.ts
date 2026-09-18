export interface FlatLoanInputs {
  principal: number
  annualRatePct: number
  termMonths: number
}

export interface FlatLoanRow {
  month: number
  year: number
  monthInYear: number
  payment: number
  interest: number
  principalPaid: number
  balance: number
}

export interface FlatLoanResult {
  monthlyPayment: number
  totalInterest: number
  totalPayment: number
  rows: FlatLoanRow[]
}

export function calculateFlatLoan(inputs: FlatLoanInputs): FlatLoanResult {
  const { principal, annualRatePct, termMonths } = inputs
  const n = Math.max(0, Math.round(termMonths))
  const totalInterest = principal * (annualRatePct / 100) * (n / 12)
  const totalPayment = principal + totalInterest
  const monthlyPayment = n <= 0 ? 0 : totalPayment / n
  const monthlyInterest = n <= 0 ? 0 : totalInterest / n
  const monthlyPrincipal = n <= 0 ? 0 : principal / n

  let balance = principal
  const rows: FlatLoanRow[] = []

  for (let m = 1; m <= n; m++) {
    const principalPaid = Math.min(monthlyPrincipal, balance)
    balance -= principalPaid
    rows.push({
      month: m,
      year: Math.ceil(m / 12),
      monthInYear: ((m - 1) % 12) + 1,
      payment: monthlyInterest + principalPaid,
      interest: monthlyInterest,
      principalPaid,
      balance,
    })
  }

  return { monthlyPayment, totalInterest, totalPayment, rows }
}
