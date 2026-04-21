"use client"

import { useState } from "react"
import { useSandbox } from "@/hooks/use-sandbox"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

export function SandboxCalculator() {
  const [principal, setPrincipal] = useState<string>("1000")
  const [rate, setRate] = useState<string>("5")
  const [years, setYears] = useState<string>("10")

  const { sandboxId, isLoading, error, result, createSandbox, executeCode, destroySandbox } =
    useSandbox()

  const handleCalculateCompoundInterest = async () => {
    try {
      if (!sandboxId) {
        await createSandbox()
        return
      }

      const code = `
        const principal = ${principal};
        const rate = ${rate};
        const years = ${years};
        const amount = principal * Math.pow(1 + rate / 100, years);
        return {
          principal,
          rate,
          years,
          finalAmount: amount.toFixed(2),
          interest: (amount - principal).toFixed(2),
        };
      `

      await executeCode(code)
    } catch (err) {
      console.error("Calculation failed:", err)
    }
  }

  const handleCleanup = async () => {
    await destroySandbox()
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Secure Financial Calculator</CardTitle>
        <CardDescription>
          Calculate compound interest safely in an isolated Vercel Sandbox environment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Principal ($)</label>
          <Input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            placeholder="1000"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Annual Interest Rate (%)</label>
          <Input
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="5"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Years</label>
          <Input
            type="number"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            placeholder="10"
            disabled={isLoading}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleCalculateCompoundInterest} disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Calculating...
              </>
            ) : sandboxId ? (
              "Calculate"
            ) : (
              "Initialize Sandbox"
            )}
          </Button>
          {sandboxId && (
            <Button variant="destructive" onClick={handleCleanup} disabled={isLoading}>
              Cleanup
            </Button>
          )}
        </div>

        {sandboxId && (
          <div className="text-sm text-muted-foreground">
            Sandbox ID: <code className="bg-muted px-1 py-0.5 rounded">{sandboxId}</code>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
            <strong>Error:</strong> {error.message}
          </div>
        )}

        {result && (
          <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg space-y-2">
            <h3 className="font-semibold text-green-900 dark:text-green-100">Results</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Principal</p>
                <p className="font-medium">${result.stdout.includes("principal") ? principal : "N/A"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Final Amount</p>
                <p className="font-medium">${result.stdout}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Interest Earned</p>
                <p className="font-medium text-green-600 dark:text-green-400">
                  {result.exitCode === 0 ? `+${(parseFloat(result.stdout) - parseFloat(principal)).toFixed(2)}` : "Error"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Execution Time</p>
                <p className="font-medium">{result.duration}ms</p>
              </div>
            </div>
            <details className="text-xs text-muted-foreground">
              <summary>Raw Output</summary>
              <pre className="mt-2 bg-muted p-2 rounded overflow-auto max-h-32">
                {result.stdout || result.stderr}
              </pre>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
