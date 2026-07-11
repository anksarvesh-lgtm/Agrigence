import { Request, Response, NextFunction } from 'express';

// 🛡️ SECURITY: Middleware to prevent unauthorized access to admin endpoints
// Validates the x-admin-key header against the ADMIN_API_KEY environment variable.
export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const adminKey = req.headers['x-admin-key'];
  const expectedKey = process.env.ADMIN_API_KEY;

  if (!expectedKey) {
    console.error('SECURITY ERROR: ADMIN_API_KEY environment variable is missing.');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (!adminKey || adminKey !== expectedKey) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing admin key' });
  }

  next();
}
