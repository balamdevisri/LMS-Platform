import rateLimit from 'express-rate-limit';

/**
 * Global Rate Limiter
 * Restricts general API requests per IP to protect server resources.
 */
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests from this IP address. Please try again after 15 minutes.',
  },
});

/**
 * Strict Auth Rate Limiter
 * Protects authentication & credential endpoints against brute-force attacks.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 login/auth attempts per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

/**
 * AI Generation Rate Limiter
 * Protects Gemini AI generation endpoints against quota exhaustion.
 */
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // Limit each IP to 20 AI generations per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'AI request limit reached. Please wait a minute before generating more content.',
  },
});