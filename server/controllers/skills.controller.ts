import { Request, Response, Router } from 'express';
import * as cors from 'cors';

import { User, Skill } from '../models';

const router = Router();

router.options('/', cors());
router.options('/:id', cors());

router.get('/', cors(), (req: Request, res: Response) => {
  Skill.find({})
    .then(doc => {
      res.json(doc);
    });
});

router.get('/:id', cors(), (req: Request, res: Response) => {
  Skill.findOne({ _id: req.params.id })
    .then(doc => {
      res.json(doc);
    });
})

router.post('/', cors(), (req: Request, res: Response) => {
  let skill = new Skill(req.body);
  skill.save()
    .then(doc => {
      return addSkill(doc);
    })
    .then(doc => {
      return res.json(doc);
    })
    .catch(err => {
      return res.status(400)
        .json(err);
    });
});

router.put('/:id', cors(), (req: Request, res: Response) => {
  Skill.findOneAndUpdate({ _id: req.params.id}, req.body)
    .then(doc => {
      return res.json(doc);
    })
    .catch(err => {
      return res.status(400)
        .json(err);
    });
});

router.delete('/:id', cors(), (req: Request, res: Response) => {
  Skill.findOneAndRemove({ _id: req.params.id })
    .then(doc => {
      return User.findOneAndUpdate(
        { _id: doc._id },
        { $pullAll: { skills: [doc]} });
    })
    .then(doc => {
      res.json(doc);
    })
    .catch(err => {
      return res.status(400)
        .json(err);
    });
});

function addSkill(skill: any) {
  return User.findOneAndUpdate(
    { id: skill.owner._id },
    { $push: { skills: skill }}
  );
}