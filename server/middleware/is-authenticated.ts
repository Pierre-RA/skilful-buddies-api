import * as express from 'express';

export function isAuthenticated (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (!req['user']) {
    return res.status(403)
      .json({
        message: 'user is not authenticated'
      });
  }
  return next();
}``