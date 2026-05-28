import { Redis } from '@upstash/redis';
import { after } from 'next/server';

const redisClient = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

// Proxy redis client to intercept flushall and execute it in background
export const redis = new Proxy(redisClient, {
  get(target, prop, receiver) {
    if (prop === 'flushall') {
      return function (...args: any[]) {
        try {
          after(async () => {
            try {
              await target.flushall(...args);
            } catch (err) {
              console.error("[Redis Proxy] Background flushall error:", err);
            }
          });
          return Promise.resolve("OK");
        } catch {
          // Fallback for CLI scripts/static compile (outside of request context)
          return target.flushall(...args);
        }
      };
    }
    const val = Reflect.get(target, prop, receiver);
    if (typeof val === 'function') {
      return val.bind(target);
    }
    return val;
  }
}) as Redis;

export function invalidateCache() {
  try {
    after(async () => {
      try {
        await redisClient.flushall();
      } catch (err) {
        console.error("[Redis] Background invalidateCache error:", err);
      }
    });
  } catch {
    redisClient.flushall().catch(e => console.error("[Redis] Fallback flushall failed:", e));
  }
}
