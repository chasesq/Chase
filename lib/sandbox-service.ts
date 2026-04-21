import { Sandbox } from "@vercel/sandbox"

export interface SandboxConfig {
  timeout?: number
  memory?: number
  cpus?: number
}

export interface SandboxExecutionResult {
  success: boolean
  stdout: string
  stderr: string
  exitCode: number
  duration: number
}

// Map to track active sandboxes (in production, use Redis or similar)
const activeSandboxes = new Map<string, Sandbox>()

/**
 * Create a new sandbox instance
 */
export async function createSandbox(config?: SandboxConfig): Promise<string> {
  try {
    const sandbox = await Sandbox.create()
    const sandboxId = `sandbox-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    activeSandboxes.set(sandboxId, sandbox)

    // Auto-cleanup after 30 minutes
    setTimeout(() => {
      destroySandbox(sandboxId)
    }, 30 * 60 * 1000)

    return sandboxId
  } catch (error) {
    console.error("[Sandbox] Failed to create sandbox:", error)
    throw new Error(`Failed to create sandbox: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Execute a command in a sandbox
 */
export async function executeSandboxCommand(
  sandboxId: string,
  command: string,
  args: string[] = []
): Promise<SandboxExecutionResult> {
  try {
    const sandbox = activeSandboxes.get(sandboxId)
    if (!sandbox) {
      throw new Error(`Sandbox ${sandboxId} not found`)
    }

    const startTime = Date.now()
    const cmd = await sandbox.runCommand(command, args)
    
    const [stdout, stderr] = await Promise.all([
      cmd.stdout(),
      cmd.stderr(),
    ])

    const duration = Date.now() - startTime
    const exitCode = await cmd.exitCode()

    return {
      success: exitCode === 0,
      stdout: stdout || "",
      stderr: stderr || "",
      exitCode: exitCode || 0,
      duration,
    }
  } catch (error) {
    console.error("[Sandbox] Command execution failed:", error)
    throw new Error(
      `Command execution failed: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

/**
 * Execute JavaScript code in a sandbox
 */
export async function executeSandboxCode(
  sandboxId: string,
  code: string,
  allowedModules?: string[]
): Promise<SandboxExecutionResult> {
  try {
    const sandbox = activeSandboxes.get(sandboxId)
    if (!sandbox) {
      throw new Error(`Sandbox ${sandboxId} not found`)
    }

    // Create a safe wrapper for the code
    const wrappedCode = `
try {
  const result = (async () => {
    ${code}
  })();
  console.log(JSON.stringify({ success: true, result: await result }));
} catch (error) {
  console.error(JSON.stringify({ success: false, error: error.message }));
}
`

    // Write the code to a file and execute it with Node.js
    const startTime = Date.now()
    const cmd = await sandbox.runCommand("node", ["-e", wrappedCode])
    
    const [stdout, stderr] = await Promise.all([
      cmd.stdout(),
      cmd.stderr(),
    ])

    const duration = Date.now() - startTime
    const exitCode = await cmd.exitCode()

    return {
      success: exitCode === 0,
      stdout: stdout || "",
      stderr: stderr || "",
      exitCode: exitCode || 0,
      duration,
    }
  } catch (error) {
    console.error("[Sandbox] Code execution failed:", error)
    throw new Error(
      `Code execution failed: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

/**
 * Stop and cleanup a sandbox
 */
export async function destroySandbox(sandboxId: string): Promise<void> {
  try {
    const sandbox = activeSandboxes.get(sandboxId)
    if (sandbox) {
      await sandbox.stop()
      activeSandboxes.delete(sandboxId)
    }
  } catch (error) {
    console.error("[Sandbox] Failed to stop sandbox:", error)
  }
}

/**
 * Get sandbox status
 */
export function getSandboxStatus(sandboxId: string): boolean {
  return activeSandboxes.has(sandboxId)
}

/**
 * Get all active sandboxes count
 */
export function getActiveSandboxesCount(): number {
  return activeSandboxes.size
}
