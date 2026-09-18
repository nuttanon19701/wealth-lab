import { createContext, useCallback, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from "react"

interface StoreContextValue {
  store: Record<string, unknown>
  setStore: Dispatch<SetStateAction<Record<string, unknown>>>
}

const CalculatorStateContext = createContext<StoreContextValue | null>(null)

/**
 * Wraps the whole app (once, above the router) so calculator inputs survive
 * switching between pages — each calculator page unmounts on navigation, but
 * this provider does not, so its store keeps the values. A hard refresh
 * remounts the provider from scratch, which is the intended reset point.
 */
export function CalculatorStateProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Record<string, unknown>>({})
  return <CalculatorStateContext.Provider value={{ store, setStore }}>{children}</CalculatorStateContext.Provider>
}

export function useCalculatorState<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const ctx = useContext(CalculatorStateContext)
  if (!ctx) throw new Error("useCalculatorState must be used within a CalculatorStateProvider")
  const { store, setStore } = ctx

  const value = (key in store ? store[key] : initialValue) as T

  const setValue = useCallback<Dispatch<SetStateAction<T>>>(
    (update) => {
      setStore((prev) => {
        const prevValue = (key in prev ? prev[key] : initialValue) as T
        const nextValue = typeof update === "function" ? (update as (p: T) => T)(prevValue) : update
        return { ...prev, [key]: nextValue }
      })
    },
    [key, setStore, initialValue],
  )

  return [value, setValue]
}
