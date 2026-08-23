import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to protect admin routes by requiring a valid x-admin-key header.
 * Fixes a critical missing authentication vulnerability on admin endpoints.
 */
export const requireAdminAuth = (req: Request, res: Response, next: NextFunction): void => {
  const adminKey = process.env.ADMIN_API_KEY;
  const providedKey = req.headers['x-admin-key'];

  if (!adminKey) {
    console.error('Security concern: ADMIN_API_KEY is not set in environment variables');
    res.status(500).json({ error: 'Server misconfiguration' });
    return;
  }

  if (!providedKey || providedKey !== adminKey) {
    res.status(401).json({ error: 'Unauthorized access' });
    return;
  }

  next();
};
