import { Request, Response, Router } from 'express';
import * as cors from 'cors';
import * as request from 'request';

import { User } from '../models/user';

const router = Router();

router.options('/', cors());
router.options('/facebook', cors());
router.options('/:id', cors());

router.get('/', cors(), (req: Request, res: Response) => {
  User.find({}, (err, doc) => {
    res.json(doc);
  });
});

router.post('/facebook', (req: Request, res: Response) => {
  request
    .get('https://graph.facebook.com/me/?access_token=' + req.body['access_token'])
    .on('response', response => {
      response.on('data', data => {
        let json = JSON.parse(data.toString());
        User.findOne({ 'social.facebook': json.id }, (err, doc) => {
          console.log(doc);
          if (doc) {
            res.json(doc);
          } else {
            let user = new User({
              name: json.name,
              social: {
                facebook: json.id
              }
            });
            user.save((err, doc) => {
              res.json(doc);
            });
          }
        });
      });
    })
    .on('error', err => {
      res.status(401)
        .json({
          message: 'failed to sign ig with facebook.'
        });
    });
});

router.get('/:id', (req: Request, res: Response) => {
  User.findOne({ _id: req.params.id }, (err, doc) => {
    res.json(doc);
  });
});

export default router;