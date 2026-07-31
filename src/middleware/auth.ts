import { Request, Response, NextFunction } from 'express';

// 🛡️ Sentinel: Ensure administrative endpoints are protected against unauthorized access
export const requireAdminAuth = (req: Request, res: Response, next: NextFunction) => {
  const adminKey = process.env.ADMIN_API_KEY;
  const providedKey = req.headers['x-admin-key'];

  if (!adminKey) {
    console.error('CRITICAL: ADMIN_API_KEY is not configured in environment variables.');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (!providedKey || providedKey !== adminKey) {
    return res.status(401).json({ error: 'Unauthorized access to admin endpoint' });
  }

  next();
};
