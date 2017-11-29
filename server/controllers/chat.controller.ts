import { Request, Response, Router } from 'express';
import * as cors from 'cors';

import { Chat } from '../models';

const router = Router();

router.options('/', cors());

router.get('/', cors(), (req: Request, res: Response) => {
  Chat.find({})
    .populate('user1')
    .populate('user2')
    .then(doc => {
    res.json(doc);
  });
});

router.get('/:id', cors(), (req: Request, res: Response) => {
  Chat.findOne({ _id: req.params.id })
    .populate('user1')
    .populate('user2')
    .then(doc => {
    res.json(doc);
  });
});

export default router;