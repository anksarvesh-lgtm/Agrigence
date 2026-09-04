import { Request, Response, NextFunction } from 'express';

export const requireAdminAuth = (req: Request, res: Response, next: NextFunction) => {
  const adminKey = req.headers['x-admin-key'];
  const expectedKey = process.env.ADMIN_API_KEY;

  if (!expectedKey) {
    console.error('CRITICAL: ADMIN_API_KEY environment variable is not set.');
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  if (!adminKey || adminKey !== expectedKey) {
    res.status(401).json({ error: 'Unauthorized: Invalid admin key' });
    return;
  }

  next();
};
