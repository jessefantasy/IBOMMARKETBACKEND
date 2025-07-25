// import { generalApiLimiter, fileUploadLimiter } from "../lib/rateLimiters.js";
import { generalApiLimiter, fileUploadLimiter } from "../utils/rateLimiter.js";

// 🌐 General API middleware
export function generalRateLimit(req, res, next) {
  const key = req.headers["x-forwarded-for"] || req.ip;

  generalApiLimiter
    .consume(key)
    .then(() => next())
    .catch((rateLimiterRes) => {
      res.set("Retry-After", rateLimiterRes.msBeforeNext / 1000);
      res.status(429).json({
        error: `Too many requests. Try again in ${Math.ceil(
          rateLimiterRes.msBeforeNext / 1000
        )} seconds.`,
      });
    });
}

// 📤 File upload-specific middleware
export function uploadRateLimit(req, res, next) {
  const key = req.ip;

  fileUploadLimiter
    .consume(key)
    .then(() => next())
    .catch((rateLimiterRes) => {
      res.set("Retry-After", rateLimiterRes.msBeforeNext / 1000);
      res.status(429).json({
        error: `Too many uploads. Try again in ${Math.ceil(
          rateLimiterRes.msBeforeNext / 1000
        )} seconds.`,
      });
    });
}
