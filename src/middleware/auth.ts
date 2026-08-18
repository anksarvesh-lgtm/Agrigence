import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to require admin authentication.
 * Checks for the x-admin-key header and compares it against the ADMIN_API_KEY environment variable.
 */
export const requireAdminAuth = (req: Request, res: Response, next: NextFunction) => {
  const adminKey = req.headers['x-admin-key'];
  const expectedKey = process.env.ADMIN_API_KEY;

  if (!expectedKey) {
    console.warn('SECURITY WARNING: ADMIN_API_KEY environment variable is not set. Admin routes are inaccessible.');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (!adminKey || adminKey !== expectedKey) {
    console.warn(`SECURITY WARNING: Unauthorized admin access attempt to ${req.path}`);
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing admin key' });
  }

  next();
};
