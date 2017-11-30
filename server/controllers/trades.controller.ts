import { Request, Response, Router } from 'express';
import * as cors from 'cors';

import { User, Trade } from '../models';

const router = Router();

router.options('/', cors());
router.options('/:id', cors());

router.get('/', cors(), (req: Request, res: Response) => {
  Trade.find({})
    .then(doc => {
      res.json(doc);
    });
});

router.get('/:id', cors(), (req: Request, res: Response) => {
  Trade.findOne({ _id: req.params.id })
    .then(doc => {
      res.json(doc);
    });
})

router.post('/', cors(), (req: Request, res: Response) => {
  let trade = new Trade(req.body);
  trade.save()
    .then(doc => {
      return addTrade(doc);
    })
    .then(doc => {
      return res.json(trade);
    })
    .catch(err => {
      return res.status(400)
        .json(err);
    });
});

router.put('/:id', cors(), (req: Request, res: Response) => {
  Trade.findOneAndUpdate({ _id: req.params.id}, req.body, { new: true })
    .then(doc => {
      return res.json(doc);
    })
    .catch(err => {
      return res.status(400)
        .json(err);
    });
});

router.delete('/:id', cors(), (req: Request, res: Response) => {
  Trade.findOneAndRemove({ _id: req.params.id })
    .then(doc => {
      return User.findOneAndUpdate(
        { _id: doc._id },
        { $pullAll: { trades: [doc]} });
    })
    .then(doc => {
      res.json(doc);
    })
    .catch(err => {
      return res.status(400)
        .json(err);
    });
});

export default router;

function addTrade(trade: any) {
  return User.findOneAndUpdate(
    { id: trade.owner._id },
    { $push: { trades: trade }}
  );
}