import { Request, Response, NextFunction } from 'express';

export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const adminKey = req.headers['x-admin-key'];
  const expectedKey = process.env.ADMIN_API_KEY;

  if (!expectedKey) {
    console.error('CRITICAL: ADMIN_API_KEY environment variable is missing.');
    return res.status(500).json({ error: 'Server misconfiguration: Authentication is unavailable.' });
  }

  if (!adminKey || adminKey !== expectedKey) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing admin key.' });
  }

  next();
}
