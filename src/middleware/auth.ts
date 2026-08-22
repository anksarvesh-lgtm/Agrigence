import { Request, Response, NextFunction } from 'express';

/**
 * 🛡️ Sentinel: Security middleware to protect admin routes.
 * Ensures the request contains a valid admin API key in the 'x-admin-key' header.
 * Fixes broken access control (BAC) where admin endpoints were previously unauthenticated.
 */
export const requireAdminAuth = (req: Request, res: Response, next: NextFunction) => {
  const adminKey = process.env.ADMIN_API_KEY;
  const providedKey = req.header('x-admin-key');

  if (!adminKey) {
    console.error('CRITICAL: ADMIN_API_KEY is not configured in environment variables.');
    return res.status(500).json({ error: 'Server misconfiguration: Admin access is disabled.' });
  }

  if (!providedKey || providedKey !== adminKey) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing admin key.' });
  }

  next();
};
