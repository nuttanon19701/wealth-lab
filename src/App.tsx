import type { ComponentType } from "react"
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom"

import { AppShell } from "@/components/layout/AppShell"
import { calculators } from "@/lib/calculators"
import { About } from "@/pages/About"
import { Home } from "@/pages/Home"
import { ComingSoon } from "@/pages/ComingSoon"
import { DcaCalculator } from "@/pages/calculators/DcaCalculator"

const calculatorPages: Record<string, ComponentType> = {
  dca: DcaCalculator,
}

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
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
  )
}

export default App
