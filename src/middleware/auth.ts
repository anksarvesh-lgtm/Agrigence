import { Request, Response, NextFunction } from 'express';

/**
 * 🛡️ Sentinel Security Fix: Added authentication middleware for admin routes
 *
 * Vulnerability: Missing authentication on sensitive endpoints. Previously, any user could access the admin routes (e.g. /api/admin/blob/upload) without authentication.
 *
 * Impact: An attacker could upload or delete files, generate daily blogs, or trigger mandi updates without authorization, leading to data manipulation, storage abuse, or potential service disruption.
 *
 * Fix: Introduced `requireAdminAuth` middleware. This middleware validates the `x-admin-key` header against the `ADMIN_API_KEY` environment variable. If unauthorized, it returns a generic 401 response without exposing sensitive details.
 */
export const requireAdminAuth = (req: Request, res: Response, next: NextFunction) => {
  const adminKey = req.header('x-admin-key');
  const expectedKey = process.env.ADMIN_API_KEY;

  if (!expectedKey) {
    console.error('CRITICAL: ADMIN_API_KEY environment variable is not set.');
    // Fail securely
    res.status(500).json({ error: 'Internal Server Error' });
    return;
  }

  if (!adminKey || adminKey !== expectedKey) {
    // Return generic 401 response without leaking details
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  next();
};
