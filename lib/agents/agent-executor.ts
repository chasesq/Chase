import { sql } from '@/lib/db';
import { JobResult, queueManager } from './queue-manager';

interface ExecutionContext {
  agentId: string;
  executionId: string;
  userId: string;
  agentType: string;
  input?: Record<string, any>;
}

interface ExecutorAPI {
  log: (message: string, data?: any) => void;
  error: (message: string, data?: any) => void;
  getAccountBalance: (accountId: string) => Promise<number>;
  listTransactions: (accountId: string, limit?: number) => Promise<any[]>;
  transferMoney: (fromAccountId: string, toAccountId: string, amount: number) => Promise<any>;
  input: Record<string, any>;
}

export class AgentExecutor {
  private logs: Array<{ level: string; message: string; data?: any }> = [];
  private maxExecutionTime = 30000; // 30 seconds

  /**
   * Execute an agent's code
   */
  async executeAgent(
    code: string,
    context: ExecutionContext
  ): Promise<JobResult> {
    const startTime = Date.now();
    this.logs = [];

    try {
      // Validate code before execution
      this.validateCode(code);

      // Create the executor API
      const api = this.createExecutorAPI(context);

      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error('Agent execution timeout')),
          this.maxExecutionTime
        )
      );

      // Execute the code with a timeout
      const executionPromise = this.runCode(code, api, context);
      const output = await Promise.race([executionPromise, timeoutPromise]);

      const executionTime = Date.now() - startTime;

      // Store result in queue manager
      await queueManager.storeJobResult(context.executionId, {
        success: true,
        output,
        executionTimeMs: executionTime,
        logs: this.logs.map(l => `[${l.level}] ${l.message}`),
      });

      // Update execution record
      await sql`
        UPDATE public.agent_executions
        SET status = 'success',
            output = ${JSON.stringify(output)},
            execution_time_ms = ${executionTime},
            completed_at = NOW(),
            updated_at = NOW()
        WHERE id = ${context.executionId}
      `;

      return {
        success: true,
        output,
        executionTimeMs: executionTime,
        logs: this.logs.map(l => `[${l.level}] ${l.message}`),
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : '';

      // Store error result
      await queueManager.storeJobResult(context.executionId, {
        success: false,
        error: errorMessage,
        executionTimeMs: executionTime,
        logs: this.logs.map(l => `[${l.level}] ${l.message}`),
      });

      // Update execution record
      await sql`
        UPDATE public.agent_executions
        SET status = 'failed',
            error_message = ${errorMessage},
            error_stack = ${errorStack},
            execution_time_ms = ${executionTime},
            completed_at = NOW(),
            updated_at = NOW()
        WHERE id = ${context.executionId}
      `;

      return {
        success: false,
        error: errorMessage,
        executionTimeMs: executionTime,
        logs: this.logs.map(l => `[${l.level}] ${l.message}`),
      };
    }
  }

  /**
   * Validate code to prevent dangerous operations
   */
  private validateCode(code: string): void {
    const dangerousPatterns = [
      /require\s*\(/i,
      /import\s+.*\s+from/i,
      /eval\s*\(/i,
      /Function\s*\(/i,
      /process\./i,
      /fs\./i,
      /child_process/i,
      /http\.request/i,
      /https\.request/i,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        throw new Error(`Dangerous pattern detected in code: ${pattern.source}`);
      }
    }
  }

  /**
   * Create the executor API for agents
   */
  private createExecutorAPI(context: ExecutionContext): ExecutorAPI {
    return {
      log: (message: string, data?: any) => {
        this.logs.push({ level: 'info', message, data });
        // Also store in database
        this.storeLog(context.executionId, context.agentId, 'info', message, data);
      },

      error: (message: string, data?: any) => {
        this.logs.push({ level: 'error', message, data });
        this.storeLog(context.executionId, context.agentId, 'error', message, data);
      },

      getAccountBalance: async (accountId: string) => {
        try {
          const result = await sql`
            SELECT current_balance FROM public.accounts
            WHERE id = ${accountId} AND user_id = ${context.userId}
          `;
          return result[0]?.current_balance || 0;
        } catch (error) {
          throw new Error(`Failed to get account balance: ${error instanceof Error ? error.message : String(error)}`);
        }
      },

      listTransactions: async (accountId: string, limit = 50) => {
        try {
          const result = await sql`
            SELECT * FROM public.transactions
            WHERE account_id = ${accountId}
            ORDER BY created_at DESC
            LIMIT ${limit}
          `;
          return result;
        } catch (error) {
          throw new Error(`Failed to list transactions: ${error instanceof Error ? error.message : String(error)}`);
        }
      },

      transferMoney: async (fromAccountId: string, toAccountId: string, amount: number) => {
        try {
          // Validate the transfer
          if (amount <= 0) {
            throw new Error('Transfer amount must be positive');
          }

          // Check source account
          const fromAccount = await sql`
            SELECT * FROM public.accounts
            WHERE id = ${fromAccountId} AND user_id = ${context.userId}
          `;

          if (!fromAccount[0]) {
            throw new Error('Source account not found');
          }

          if (fromAccount[0].current_balance < amount) {
            throw new Error('Insufficient funds');
          }

          // Create transaction records
          const transaction = await sql`
            INSERT INTO public.transactions (
              account_id, transaction_type, amount, description, status
            ) VALUES (
              ${fromAccountId}, 'transfer_sent', ${amount}, 'Agent-initiated transfer', 'completed'
            )
            RETURNING *
          `;

          // Update account balances
          await sql`
            UPDATE public.accounts
            SET current_balance = current_balance - ${amount}
            WHERE id = ${fromAccountId}
          `;

          await sql`
            UPDATE public.accounts
            SET current_balance = current_balance + ${amount}
            WHERE id = ${toAccountId}
          `;

          return transaction[0];
        } catch (error) {
          throw new Error(`Transfer failed: ${error instanceof Error ? error.message : String(error)}`);
        }
      },

      input: context.input || {},
    };
  }

  /**
   * Run the agent code in a controlled environment
   */
  private async runCode(
    code: string,
    api: ExecutorAPI,
    context: ExecutionContext
  ): Promise<Record<string, any>> {
    // Create a function from the code
    // The code should return a value or be async
    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
    
    try {
      const agentFunction = new AsyncFunction('api', code);
      const result = await agentFunction(api);

      return {
        success: true,
        result,
        executedAt: new Date().toISOString(),
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Store logs in database (non-blocking)
   */
  private async storeLog(
    executionId: string,
    agentId: string,
    level: string,
    message: string,
    data?: any
  ): Promise<void> {
    try {
      await sql`
        INSERT INTO public.agent_logs (
          execution_id, agent_id, log_level, message, data
        ) VALUES (
          ${executionId}, ${agentId}, ${level}, ${message}, ${data ? JSON.stringify(data) : null}
        )
      `.catch(err => console.error('[AgentExecutor] Failed to store log:', err));
    } catch (error) {
      // Log storage should not block execution
      console.error('[AgentExecutor] Error storing log:', error);
    }
  }
}

export const agentExecutor = new AgentExecutor();
