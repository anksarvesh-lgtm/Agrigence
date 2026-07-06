import { Request, Response, NextFunction } from 'express';

export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const adminKey = process.env.ADMIN_API_KEY;
  const providedKey = req.headers['x-admin-key'];

  if (!adminKey) {
    console.error('CRITICAL: ADMIN_API_KEY is not set in environment variables.');
    return res.status(500).json({ error: 'Server misconfiguration: missing admin key.' });
  }

  if (!providedKey || providedKey !== adminKey) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing admin key.' });
  }

  next();
}
