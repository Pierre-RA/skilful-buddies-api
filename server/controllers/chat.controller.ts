import { Request, Response, Router } from 'express';
import * as cors from 'cors';

import { Chat } from '../models';

const router = Router();

router.options('/', cors());
router.options('/:id', cors());

router.get('/', cors(), (req: Request, res: Response) => {
  Chat.find({})
    .populate('user1')
    .populate('user2')
    .then(doc => {
      res.json(doc);
    })
    .catch(err => {
      res.status(400)
        .json(err);
    });
});

router.get('/:id', cors(), (req: Request, res: Response) => {
  Chat.findOne({ _id: req.params.id })
    .populate('user1')
    .populate('user2')
    .then(doc => {
      res.json(doc);
    })
    .catch(err => {
      res.status(400)
        .json(err);
    });
});

router.post('/', cors(), (req: Request, res: Response) => {
  let chat = new Chat(req.body);
  chat.save()
    .then(doc => {
      return doc.populate('user1').execPopulate();
    })
    .then(doc => {
      return doc.populate('user2').execPopulate();
    })
    .then(doc => {
      res.json(doc);
    })
    .catch(err => {
      res.status(400)
        .json(err);
    })
});

export default router;