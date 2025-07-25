import { RateLimiterRedis } from "rate-limiter-flexible";
import Redis from "ioredis";

const redisClient = new Redis(
  "rediss://default:AY8BAAIncDFkMTZkMWUyOTJjZGQ0YTRhOTYwM2E4NWY2MjMyNGVjMXAxMzY2MDk@wanted-rhino-36609.upstash.io:6379"
);
// 🌐 1. General API Rate Limiter: 100 requests per 15 minutes per IP
export const generalApiLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "general_api",
  points: 500, // Max 100 requests
  duration: 900, // Per 15 minutes (900s)
});

// 📤 2. File Upload Limiter: 1 upload per minute per IP
export const fileUploadLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "upload_limit",
  points: 1, // Max 1 upload
  duration: 60, // Per 60 seconds
});
