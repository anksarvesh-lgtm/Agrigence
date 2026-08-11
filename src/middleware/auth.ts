import { Request, Response, NextFunction } from 'express';

export const requireAdminAuth = (req: Request, res: Response, next: NextFunction) => {
  const adminKey = req.headers['x-admin-key'];
  const validAdminKey = process.env.ADMIN_API_KEY;

  if (!validAdminKey) {
    console.error('Security Alert: ADMIN_API_KEY environment variable is not set. Admin endpoints are disabled.');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (!adminKey || adminKey !== validAdminKey) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing admin key' });
  }

  next();
};
