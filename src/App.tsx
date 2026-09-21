import type { ComponentType } from "react"
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom"

import { RequireAuth } from "@/components/admin/RequireAuth"
import { AppShell } from "@/components/layout/AppShell"
import { AuthProvider } from "@/lib/auth"
import { calculators } from "@/lib/calculators"
import { CalculatorStateProvider } from "@/lib/calculatorStateStore"
import { AdminDashboard } from "@/pages/admin/AdminDashboard"
import { AdminEditor } from "@/pages/admin/AdminEditor"
import { AdminLogin } from "@/pages/admin/AdminLogin"
import { About } from "@/pages/About"
import { Home } from "@/pages/Home"
import { Knowledge } from "@/pages/Knowledge"
import { KnowledgeArticle } from "@/pages/KnowledgeArticle"
import { ComingSoon } from "@/pages/ComingSoon"
import { BucketStrategyCalculator } from "@/pages/calculators/BucketStrategyCalculator"
import { DcaCalculator } from "@/pages/calculators/DcaCalculator"
import { LoanAmortizedCalculator } from "@/pages/calculators/LoanAmortizedCalculator"
import { LoanFlatCalculator } from "@/pages/calculators/LoanFlatCalculator"
import { PvdCalculator } from "@/pages/calculators/PvdCalculator"
import { RebalanceCalculator } from "@/pages/calculators/RebalanceCalculator"
import { RetirementCalculator } from "@/pages/calculators/RetirementCalculator"
import { TaxCalculator } from "@/pages/calculators/TaxCalculator"
import { TvmCalculator } from "@/pages/calculators/TvmCalculator"

const calculatorPages: Record<string, ComponentType> = {
  dca: DcaCalculator,
  rebalance: RebalanceCalculator,
  retirement: RetirementCalculator,
  "loan-amortized": LoanAmortizedCalculator,
  "loan-flat": LoanFlatCalculator,
  tvm: TvmCalculator,
  tax: TaxCalculator,
  pvd: PvdCalculator,
  "bucket-strategy": BucketStrategyCalculator,
}

function App() {
  return (
    <CalculatorStateProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="admin/login" element={<AdminLogin />} />
            <Route
              path="admin"
              element={
                <RequireAuth>
                  <AdminDashboard />
                </RequireAuth>
              }
            />
            <Route
              path="admin/new"
              element={
                <RequireAuth>
                  <AdminEditor />
                </RequireAuth>
              }
            />
            <Route
              path="admin/edit/:id"
              element={
                <RequireAuth>
                  <AdminEditor />
                </RequireAuth>
              }
            />

            <Route element={<AppShell />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="knowledge" element={<Knowledge />} />
              <Route path="knowledge/:slug" element={<KnowledgeArticle />} />
              {calculators.map((calc) => {
                const Page = calculatorPages[calc.id]
                return (
                  <Route
                    key={calc.id}
                    path={calc.path.replace(/^\//, "")}
                    element={Page ? <Page /> : <ComingSoon title={calc.name} />}
                  />
                )
              })}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </CalculatorStateProvider>
  )
}

export default App
