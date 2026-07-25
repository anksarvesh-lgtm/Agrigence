import { Request, Response, NextFunction } from 'express';

// 🛡️ Security Concern: Protect admin routes from unauthorized access
// This middleware ensures that only clients with the correct ADMIN_API_KEY
// can access sensitive admin functionalities, preventing unauthorized data modification.
export const requireAdminAuth = (req: Request, res: Response, next: NextFunction) => {
  const adminKey = req.header('x-admin-key');

  if (!process.env.ADMIN_API_KEY) {
    console.warn('ADMIN_API_KEY is not set in environment variables');
    // If it's not set, we should probably fail securely and block access.
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
    res.status(401).json({ error: 'Unauthorized access' });
    return;
  }

  next();
};
