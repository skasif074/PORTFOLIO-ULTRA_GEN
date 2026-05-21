import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import dotenv from 'dotenv';

dotenv.config();

// Require authenticated Clerk session
export const requireAuth = (req, res, next) => {
  ClerkExpressRequireAuth()(req, res, (err) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }
    req.userId = req.auth?.userId || null;
    next();
  });
};

// Require admin
export const requireAdmin = (req, res, next) => {
  ClerkExpressRequireAuth()(req, res, (err) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const userId = req.auth?.userId;
    const adminUserId = process.env.ADMIN_CLERK_USER_ID;

    if (userId !== adminUserId) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    req.userId = userId;
    req.isAdmin = true;
    next();
  });
};

// Optional auth
export const optionalAuth = (req, res, next) => {
  ClerkExpressRequireAuth()(req, res, () => {
    req.userId = req.auth?.userId || null;
    next();
  });
};