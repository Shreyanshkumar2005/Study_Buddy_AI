const { AppError } = require('./errorHandler');

/**
 * Custom in-memory sliding-window rate limiter built without external packages.
 * Tracks requests per user (or client IP) within a configured time window.
 */
const createRateLimiter = (options = {}) => {
  const windowMs = (options.windowMinutes || parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES, 10) || 15) * 60 * 1000;
  const maxRequests = options.max || parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 15;
  const storage = new Map();

  // Periodic cleanup of expired records every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of storage.entries()) {
      if (now > record.resetTime) {
        storage.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref();

  return (req, res, next) => {
    // Identify user by authenticated user ID, or fallback to client IP
    const identifier = req.user ? String(req.user._id) : req.ip || 'anonymous';
    const now = Date.now();

    let record = storage.get(identifier);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs
      };
      storage.set(identifier, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, maxRequests - record.count);
    const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);

    // Set standard rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > maxRequests) {
      res.setHeader('Retry-After', retryAfterSec);
      return next(
        new AppError(
          `AI request limit reached (${maxRequests} requests per ${windowMs / 60000} minutes). Please wait ${retryAfterSec}s before trying again.`,
          429
        )
      );
    }

    next();
  };
};

// Rate limiter instance specifically for AI generation endpoints
const aiRateLimiter = createRateLimiter({
  windowMinutes: 15,
  max: 10
});

module.exports = { createRateLimiter, aiRateLimiter };
