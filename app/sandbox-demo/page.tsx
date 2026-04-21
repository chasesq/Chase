"use client"

import { SandboxCalculator } from "@/components/sandbox-calculator"

export default function SandboxDemoPage() {
  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Vercel Sandbox Demo</h1>
          <p className="text-muted-foreground">
            Experience secure, isolated code execution for MyBank financial calculations
          </p>
        </div>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-4">Financial Calculator</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Each calculation runs in an isolated Vercel Sandbox environment, ensuring security
              and reliability. No access to sensitive banking data or other users' information.
            </p>
          </div>
          <SandboxCalculator />
        </section>

        <section className="bg-muted p-6 rounded-lg space-y-3">
          <h3 className="font-semibold">How It Works</h3>
          <ul className="text-sm space-y-2 list-disc list-inside text-muted-foreground">
            <li>Click "Initialize Sandbox" to create an isolated environment</li>
            <li>Enter your investment parameters (principal, rate, years)</li>
            <li>Click "Calculate" to run the compound interest formula safely</li>
            <li>Results are computed in an isolated sandbox with no data leaks</li>
            <li>Click "Cleanup" to stop the sandbox and free resources</li>
          </ul>
        </section>

        <section className="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg space-y-3">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100">Use Cases</h3>
          <ul className="text-sm space-y-2 text-blue-800 dark:text-blue-200 list-disc list-inside">
            <li>Safe execution of user-provided financial formulas</li>
            <li>Isolated data processing for privacy-sensitive calculations</li>
            <li>AI-generated financial advice without direct database access</li>
            <li>Budget simulation and financial planning tools</li>
            <li>Risk analysis and portfolio optimization algorithms</li>
          </ul>
        </section>
      </div>
    </main>
  )
}
