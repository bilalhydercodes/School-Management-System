import { Worker, Job } from 'bullmq';
import { redis } from '@/lib/redis';
import { NOTIFICATIONS_HIGH_QUEUE } from '@/lib/queue';
import { prisma } from '@/lib/db';
import { sendPasswordResetOtpEmail, sendSmsOtp } from '@/lib/email';

export interface NotificationJobData {
  type?: 'send-in-app' | 'send-email' | 'send-sms' | 'broadcast' | 'batch-import';
  notificationId?: string;
  tenantId?: string;
  recipientId?: string;
  to?: string;
  phone?: string;
  subject?: string;
  title?: string;
  body?: string;
  otp?: string;
  tenantName?: string;
  recipientName?: string;
  metadata?: Record<string, unknown>;
}

/**
 * BullMQ Worker instance processing high-priority notifications and async jobs.
 */
export function createNotificationWorker() {
  if (!redis) {
    console.warn('[WORKER-WARN] Redis is not configured or available. Worker cannot start.');
    return null;
  }

  const worker = new Worker<NotificationJobData>(
    NOTIFICATIONS_HIGH_QUEUE,
    async (job: Job<NotificationJobData>) => {
      console.info(`[WORKER-JOB-START] Processing job ${job.id} of name "${job.name}"...`);
      const data = job.data;

      switch (job.name) {
        case 'send-email': {
          if (data.to && data.otp) {
            const result = await sendPasswordResetOtpEmail({
              to: data.to,
              otp: data.otp,
              tenantName: data.tenantName || 'School Management System',
              recipientName: data.recipientName || 'User',
            });
            if (!result.success) {
              throw new Error(`Email dispatch failed: ${result.error}`);
            }
          }
          break;
        }

        case 'send-sms': {
          if (data.phone && data.otp) {
            const result = await sendSmsOtp({
              phone: data.phone,
              otp: data.otp,
              tenantName: data.tenantName || 'School ERP',
            });
            if (!result.success) {
              throw new Error(`SMS dispatch failed: ${result.error}`);
            }
          }
          break;
        }

        case 'send-in-app': {
          if (data.notificationId) {
            const notif = await prisma.notification.findUnique({
              where: { id: data.notificationId },
              include: { recipient: true },
            });
            if (notif) {
              console.info(`[WORKER] In-app notification confirmed for user ${notif.recipientId}: "${notif.title}"`);
            }
          }
          break;
        }

        case 'broadcast': {
          console.info(`[WORKER] Broadcast notification job processed for tenant ${data.tenantId}: "${data.title}"`);
          break;
        }

        default: {
          console.info(`[WORKER] Processed generic job "${job.name}" with ID: ${job.id}`);
          break;
        }
      }

      return { processedAt: new Date().toISOString(), status: 'SUCCESS' };
    },
    {
      connection: redis,
      concurrency: 5,
      limiter: {
        max: 50,
        duration: 1000,
      },
    }
  );

  worker.on('completed', (job: Job) => {
    console.info(`[WORKER-JOB-COMPLETED] Job ${job.id} (${job.name}) completed successfully.`);
  });

  worker.on('failed', (job: Job | undefined, err: Error) => {
    console.error(`[WORKER-JOB-FAILED] Job ${job?.id} (${job?.name}) failed: ${err.message}`);
  });

  worker.on('error', (err: Error) => {
    console.error(`[WORKER-ERROR] BullMQ worker error: ${err.message}`);
  });

  const shutdown = async () => {
    console.info('[WORKER-SHUTDOWN] Gracefully shutting down notification worker...');
    await worker.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  console.info(`[WORKER-READY] Notification background worker listening on queue "${NOTIFICATIONS_HIGH_QUEUE}".`);
  return worker;
}

// Standalone execution entry point
if (require.main === module || process.env.RUN_STANDALONE_WORKER === 'true') {
  createNotificationWorker();
}
