import { Request, Response, Router } from 'express';
import * as dotenv from 'dotenv';
import canSignUp from '../middleware/can-sign-up';
let pkg = require(__dirname + '/../../package.json');

dotenv.config();
const router = Router();

let signupStatus = process.env.SIGNUP_STATUS || 'off';

/**
 * GET /
 * Basic welcome route
 */
router.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to Skilful API',
    version: pkg.version,
  });
});

/**
 * GET /signup
 * send a status about the ability to signup
 */
router.get('/signup', (req: Request, res: Response) => {
  res.json({
    status: signupStatus
  });
});

/**
 * POST /signup
 * signup process
 */
router.post('/signup', canSignUp, (req: Request, res: Response) => {
  res.json({
    message: 'ok'
  });
});

// router.post('/signin');

export default router;
