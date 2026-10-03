import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

function createRedisClient(): Redis | null {
  try {
    const rawUrl = process.env.REDIS_URL;
    // If no REDIS_URL configured in production or serverless, return null to use instant in-memory store
    if (!rawUrl || rawUrl.trim() === '' || rawUrl.includes('placeholder')) {
      return null;
    }

    const client = new Redis(rawUrl, {
      maxRetriesPerRequest: 1,
      connectTimeout: 500, // 500ms max timeout to prevent stalling auth requests
      retryStrategy(times) {
        if (times > 2) return null; // stop retrying after 2 attempts
        return 100;
      },
      lazyConnect: true,
      enableOfflineQueue: false,
    });

    client.on('error', () => {
      // Suppress unhandled error event exceptions when Redis is offline
    });

    return client;
  } catch {
    return null;
  }
}

export const redis = globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== 'production' && redis) {
  globalForRedis.redis = redis;
}

/**
 * Checks whether Redis is online and responding to PING.
 */
export async function isRedisAvailable(): Promise<boolean> {
  if (!redis) return false;
  try {
    const res = await redis.ping();
    return res === 'PONG';
  } catch {
    return false;
  }
}
