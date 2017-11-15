import { Request, Response, Router } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to Skilful API',
  });
});

export default router;