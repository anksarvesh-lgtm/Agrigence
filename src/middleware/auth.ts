import { Request, Response, NextFunction } from 'express';

// Security enhancement: Require admin authentication for sensitive routes
// This prevents unauthorized access to critical admin functions
export const requireAdminAuth = (req: Request, res: Response, next: NextFunction) => {
  const adminKey = req.headers['x-admin-key'];
  const expectedKey = process.env.ADMIN_API_KEY;

  if (!expectedKey) {
    console.error('CRITICAL: ADMIN_API_KEY environment variable is not set');
    return res.status(500).json({ error: 'Internal Server Error' });
  }

  if (!adminKey || adminKey !== expectedKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
};
