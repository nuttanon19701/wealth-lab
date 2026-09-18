export interface AmortizedLoanInputs {
  principal: number
  annualRatePct: number
  termMonths: number
  extraPayment: number
}

export interface AmortizedLoanRow {
  month: number
  year: number
  monthInYear: number
  payment: number
  interest: number
  principalPaid: number
  balance: number
}

export interface AmortizedLoanResult {
  minMonthlyPayment: number
  totalMonthlyPayment: number
  rows: AmortizedLoanRow[]
  totalInterest: number
  totalPayment: number
  actualMonths: number
  interestSaved: number
  monthsReduced: number
}

const MAX_MONTHS_SAFETY_CAP = 1200

export function calculateAmortizedLoan(inputs: AmortizedLoanInputs): AmortizedLoanResult {
  const { principal, annualRatePct, termMonths, extraPayment } = inputs
  const monthlyRate = annualRatePct / 100 / 12
  const n = Math.max(0, Math.round(termMonths))

  const minMonthlyPayment =
    n <= 0
      ? 0
      : monthlyRate === 0
        ? principal / n
        : (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n))
  const totalMonthlyPayment = minMonthlyPayment + Math.max(0, extraPayment)

  let balance = principal
  const rows: AmortizedLoanRow[] = []
  let totalInterest = 0
  let totalPayment = 0
  let month = 0

  while (balance > 0.01 && month < MAX_MONTHS_SAFETY_CAP) {
    month++
    const interest = balance * monthlyRate
    let principalPaid = totalMonthlyPayment - interest
    if (principalPaid > balance) principalPaid = balance
    if (principalPaid < 0) principalPaid = 0
    const payment = interest + principalPaid
    balance -= principalPaid
    totalInterest += interest
    totalPayment += payment

    rows.push({
      month,
      year: Math.ceil(month / 12),
      monthInYear: ((month - 1) % 12) + 1,
      payment,
      interest,
      principalPaid,
      balance,
    })

    if (principalPaid <= 0) break
  }

  const actualMonths = month
  const interestWithoutExtra = minMonthlyPayment * n - principal
  const interestSaved = Math.max(0, interestWithoutExtra - totalInterest)
  const monthsReduced = Math.max(0, n - actualMonths)

  return {
    minMonthlyPayment,
    totalMonthlyPayment,
    rows,
    totalInterest,
    totalPayment,
    actualMonths,
    interestSaved,
    monthsReduced,
  }
}
