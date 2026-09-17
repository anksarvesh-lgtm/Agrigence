import { Request, Response, NextFunction } from 'express';

export const requireAdminAuth = (req: Request, res: Response, next: NextFunction) => {
  const adminKey = req.headers['x-admin-key'];
  const expectedKey = process.env.ADMIN_API_KEY;

  if (!expectedKey) {
    console.error('CRITICAL: ADMIN_API_KEY is not configured on the server.');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (!adminKey || adminKey !== expectedKey) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing admin key' });
  }

  next();
};
