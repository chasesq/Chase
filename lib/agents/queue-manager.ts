import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
});

export interface AgentJob {
  agentId: string;
  executionId: string;
  userId: string;
  code: string;
  agentType: string;
  input?: Record<string, any>;
  timestamp: number;
}

export interface JobResult {
  success: boolean;
  output?: Record<string, any>;
  error?: string;
  executionTimeMs: number;
  logs: string[];
}

export class QueueManager {
  private readonly QUEUE_NAME = 'agent-jobs';
  private readonly FAILED_QUEUE = 'agent-jobs-failed';
  private readonly JOB_EXPIRY = 86400 * 7; // 7 days

  /**
   * Add a job to the queue
   */
  async enqueueJob(job: AgentJob): Promise<string> {
    try {
      const jobId = `${job.executionId}-${Date.now()}`;
      const jobData = JSON.stringify(job);

      // Push to the main queue
      await redis.lpush(this.QUEUE_NAME, jobData);

      // Store job details with expiry
      await redis.setex(
        `job:${jobId}`,
        this.JOB_EXPIRY,
        JSON.stringify({
          ...job,
          jobId,
          status: 'queued',
          queuedAt: new Date().toISOString(),
        })
      );

      return jobId;
    } catch (error) {
      console.error('[QueueManager] Error enqueuing job:', error);
      throw new Error(`Failed to queue agent job: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get the next job from the queue
   */
  async dequeueJob(): Promise<AgentJob | null> {
    try {
      const jobData = await redis.rpop(this.QUEUE_NAME);
      if (!jobData) return null;

      return JSON.parse(jobData as string);
    } catch (error) {
      console.error('[QueueManager] Error dequeuing job:', error);
      return null;
    }
  }

  /**
   * Get pending jobs count
   */
  async getPendingJobsCount(): Promise<number> {
    try {
      const count = await redis.llen(this.QUEUE_NAME);
      return count || 0;
    } catch (error) {
      console.error('[QueueManager] Error getting job count:', error);
      return 0;
    }
  }

  /**
   * Store job result
   */
  async storeJobResult(
    executionId: string,
    result: JobResult,
    retryCount: number = 0
  ): Promise<void> {
    try {
      const resultKey = `result:${executionId}`;
      await redis.setex(
        resultKey,
        this.JOB_EXPIRY,
        JSON.stringify({
          ...result,
          executionId,
          storedAt: new Date().toISOString(),
          retryCount,
        })
      );
    } catch (error) {
      console.error('[QueueManager] Error storing job result:', error);
      throw error;
    }
  }

  /**
   * Get job result
   */
  async getJobResult(executionId: string): Promise<JobResult | null> {
    try {
      const resultKey = `result:${executionId}`;
      const result = await redis.get(resultKey);
      return result ? JSON.parse(result as string) : null;
    } catch (error) {
      console.error('[QueueManager] Error getting job result:', error);
      return null;
    }
  }

  /**
   * Move failed job to dead letter queue
   */
  async moveToFailedQueue(job: AgentJob, error: string, retryCount: number): Promise<void> {
    try {
      const failedJob = {
        ...job,
        failedAt: new Date().toISOString(),
        error,
        retryCount,
      };

      await redis.lpush(this.FAILED_QUEUE, JSON.stringify(failedJob));
      
      // Store in cache for later inspection
      await redis.setex(
        `failed:${job.executionId}`,
        this.JOB_EXPIRY,
        JSON.stringify(failedJob)
      );
    } catch (error) {
      console.error('[QueueManager] Error moving to failed queue:', error);
    }
  }

  /**
   * Get failed jobs
   */
  async getFailedJobs(limit: number = 100): Promise<AgentJob[]> {
    try {
      const jobs = await redis.lrange(this.FAILED_QUEUE, 0, limit - 1);
      return jobs.map(job => JSON.parse(job as string));
    } catch (error) {
      console.error('[QueueManager] Error getting failed jobs:', error);
      return [];
    }
  }

  /**
   * Retry a failed job
   */
  async retryFailedJob(executionId: string): Promise<boolean> {
    try {
      const failedKey = `failed:${executionId}`;
      const failedJob = await redis.get(failedKey);

      if (!failedJob) return false;

      const job = JSON.parse(failedJob as string);
      if (job.retryCount >= 3) return false; // Max retries exceeded

      // Re-enqueue with incremented retry count
      job.retryCount = (job.retryCount || 0) + 1;
      await redis.lpush(this.QUEUE_NAME, JSON.stringify(job));

      return true;
    } catch (error) {
      console.error('[QueueManager] Error retrying failed job:', error);
      return false;
    }
  }

  /**
   * Clear a job's cached result
   */
  async clearJobResult(executionId: string): Promise<void> {
    try {
      await redis.del(`result:${executionId}`);
    } catch (error) {
      console.error('[QueueManager] Error clearing job result:', error);
    }
  }
}

export const queueManager = new QueueManager();
