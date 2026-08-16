import { Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';

dotenv.config();

// Security: Enforce authentication on admin routes
export const requireAdminAuth = (req: Request, res: Response, next: NextFunction) => {
  const adminKey = process.env.ADMIN_API_KEY;
  const providedKey = req.headers['x-admin-key'];

  if (!adminKey) {
    console.error('CRITICAL: ADMIN_API_KEY is not configured');
    return res.status(500).json({ error: 'Server misconfiguration: admin auth not configured' });
  }

  if (!providedKey || providedKey !== adminKey) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing admin key' });
  }

  next();
};
