import { Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';
dotenv.config();

export default function canSignUp(
  req: Request, res: Response, next: NextFunction
) {
  const signUp = process.env.SIGNUP_STATUS || 'off';

  // SIGNUP_STATUS is on, then process to sign-up
  if (signUp == 'on') {
    return next();
  }
  
  // No authorization set, return 401
  if (!req.headers['authorization']) {
    return res.status(401).json({
      message: 'Open signup is disabled.'
    });
  }
  
  // Authorization ADMIN_TOKEN match, process to sign-up
  if (req.headers['authorization'] == process.env.ADMIN_TOKEN) {
    req.body.isAdmin = true;
    return next();
  }
  
  // Authorization failed
  return res.status(401).json({
    message: 'Open signup is disabled - wrong token'
  });
}