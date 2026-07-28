import { Request, Response, NextFunction } from 'express';

export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  // Security concern: Ensure admin endpoints are protected against unauthorized access
  const adminKey = process.env.ADMIN_API_KEY;
  const requestKey = req.header('x-admin-key');

  if (!adminKey) {
    console.error('CRITICAL: ADMIN_API_KEY is not configured in environment variables.');
    return res.status(500).json({ error: 'Server misconfiguration: Authentication is not properly setup.' });
  }

  if (!requestKey || requestKey !== adminKey) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing admin key.' });
  }

  next();
}
