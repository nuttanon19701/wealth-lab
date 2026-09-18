export interface RebalanceAsset {
  id: string
  name: string
  currentValue: number
  expectedPct: number
}

export interface RebalanceRow extends RebalanceAsset {
  currentPct: number
  expectedValue: number
  action: number
}

export interface RebalanceResult {
  rows: RebalanceRow[]
  totalCurrentValue: number
  totalExpectedPct: number
}

export function calculateRebalance(assets: RebalanceAsset[]): RebalanceResult {
  const totalCurrentValue = assets.reduce((sum, a) => sum + a.currentValue, 0)
  const totalExpectedPct = assets.reduce((sum, a) => sum + a.expectedPct, 0)

  const rows: RebalanceRow[] = assets.map((a) => {
    const expectedValue = totalCurrentValue * (a.expectedPct / 100)
    return {
      ...a,
      currentPct: totalCurrentValue > 0 ? (a.currentValue / totalCurrentValue) * 100 : 0,
      expectedValue,
      action: expectedValue - a.currentValue,
    }
  })

  return { rows, totalCurrentValue, totalExpectedPct }
}

export function createEmptyAsset(index: number): RebalanceAsset {
  return {
    id: `asset-${Date.now()}-${index}`,
    name: `สินทรัพย์ ${index + 1}`,
    currentValue: 0,
    expectedPct: 0,
  }
}
