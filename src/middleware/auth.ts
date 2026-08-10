import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to require admin authentication for sensitive backend endpoints.
 * Validates the 'x-admin-key' header against the ADMIN_API_KEY environment variable.
 */
export const requireAdminAuth = (req: Request, res: Response, next: NextFunction) => {
  const adminKey = req.headers['x-admin-key'];
  const expectedKey = process.env.ADMIN_API_KEY;

  if (!expectedKey) {
    console.error('CRITICAL: ADMIN_API_KEY is not configured in environment variables.');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (!adminKey || adminKey !== expectedKey) {
    console.warn(`Unauthorized access attempt to admin endpoint: ${req.path}`);
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing admin key' });
  }

  next();
};
