import { useState, useCallback } from "react"
import type { SandboxExecutionResult } from "@/lib/sandbox-service"

export interface UseSandboxOptions {
  onSuccess?: (result: SandboxExecutionResult) => void
  onError?: (error: Error) => void
}

export function useSandbox(options?: UseSandboxOptions) {
  const [sandboxId, setSandboxId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [result, setResult] = useState<SandboxExecutionResult | null>(null)

  const createSandbox = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch("/api/sandbox/create", { method: "POST" })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create sandbox")
      }

      setSandboxId(data.sandboxId)
      return data.sandboxId
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      options?.onError?.(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [options])

  const executeCommand = useCallback(
    async (command: string, args: string[] = []) => {
      if (!sandboxId) {
        const error = new Error("Sandbox not initialized. Call createSandbox first.")
        setError(error)
        options?.onError?.(error)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch("/api/sandbox/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sandboxId, command, args }),
        })
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Command execution failed")
        }

        setResult(data.result)
        options?.onSuccess?.(data.result)
        return data.result
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setError(error)
        options?.onError?.(error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [sandboxId, options]
  )

  const executeCode = useCallback(
    async (code: string) => {
      if (!sandboxId) {
        const error = new Error("Sandbox not initialized. Call createSandbox first.")
        setError(error)
        options?.onError?.(error)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch("/api/sandbox/eval", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sandboxId, code }),
        })
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Code execution failed")
        }

        setResult(data.result)
        options?.onSuccess?.(data.result)
        return data.result
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setError(error)
        options?.onError?.(error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [sandboxId, options]
  )

  const destroySandbox = useCallback(async () => {
    if (!sandboxId) return

    try {
      await fetch("/api/sandbox/destroy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sandboxId }),
      })
      setSandboxId(null)
      setResult(null)
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      options?.onError?.(error)
    }
  }, [sandboxId, options])

  return {
    sandboxId,
    isLoading,
    error,
    result,
    createSandbox,
    executeCommand,
    executeCode,
    destroySandbox,
  }
}
