import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to require admin authentication.
 *
 * SECURITY: This middleware protects sensitive admin endpoints from unauthorized access.
 * It expects a valid API key in the 'x-admin-key' header that matches the ADMIN_API_KEY
 * environment variable. If the header is missing, invalid, or the environment variable
 * is not set, it returns a 401 Unauthorized or 403 Forbidden status.
 * This prevents unauthenticated users from performing critical actions like uploading/deleting
 * blobs or triggering automated jobs.
 */
export const requireAdminAuth = (req: Request, res: Response, next: NextFunction) => {
  const adminKey = process.env.ADMIN_API_KEY;
  const providedKey = req.headers['x-admin-key'];

  if (!adminKey) {
    console.error('CRITICAL: ADMIN_API_KEY environment variable is not set. Admin endpoints are disabled for security.');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (!providedKey) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (providedKey !== adminKey) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  next();
};
