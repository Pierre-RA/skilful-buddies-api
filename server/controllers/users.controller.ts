import { Request, Response, Router } from 'express';
import * as cors from 'cors';
import * as request from 'request-promise';
import * as slug from 'slug';

import { User } from '../models/user';

const router = Router();

router.options('/', cors());
router.options('/facebook', cors());
router.options('/:id', cors());

router.get('/', cors(), (req: Request, res: Response) => {
  User.find({})
    .populate('friends')
    .then(doc => {
    res.json(doc);
  });
});

router.post('/facebook', cors(), (req: Request, res: Response) => {
  let fbUser: any;
  getFbUser(req.body['access_token'])
    .then((response: any) => {
      fbUser = response;
      return findByFacebookId(fbUser.id);
    })
    .then((doc: any) => {
      if (!doc) {
        let user = new User({
          name: fbUser.name,
          slug: slug(fbUser.name),
          gender: fbUser.gender,
          social: {
            facebook: fbUser.id
          },
        });
        return user.save();
      }
      return new Promise((resolve, reject) => { resolve(doc); });
    })
    .then((doc: any) => {
      return updateFriends(doc, req.body['access_token']);
    })
    .then((doc: any) => {
      return updatePicture(doc, req.body['access_token']);
    })
    .then((doc: any) => {
      res.json(doc);
    })
    .catch((err: any) => {
      res.status(401).json({
        message: 'cannot login to facebook.',
        error: err
      });
    });
});

router.get('/:id', cors(), (req: Request, res: Response) => {
  User.findOne({ _id: req.params.id })
    .populate('friends')
    .then(doc => {
    res.json(doc);
  });
});

router.put(':/id', cors(), (req: Request, res: Response) => {
  User.findOneAndUpdate({ _id: req.params.id }, req.body)
    .then(doc => {
      res.json(doc);
    })
    .catch(err => {
      res.status(400)
        .json(err);
    });
});

export default router;

function findByFacebookId(id: string) {
  return User.findOne({ 'social.facebook' : id });
}

function getFbUser(fbToken: string) {
  return request({
    method: 'GET',
    uri: 'https://graph.facebook.com/me/?fields=name,gender&access_token=' + fbToken,
    json: true
  });
}

function getFbFriends(fbToken: string) {
  return request({
    method: 'GET',
    uri: 'https://graph.facebook.com/me/friends?access_token=' + fbToken,
    json: true
  });
}

function getFbPicture(fbToken: string) {
  return request({
    method: 'GET',
    uri: 'https://graph.facebook.com/me/picture?type=large&redirect=false&access_token=' + fbToken,
    json: true
  });
}

function updatePicture(user: any, token: string) {
  return getFbPicture(token)
    .then((response: any) => {
      return User.findOneAndUpdate(
        { _id: user.id },
        { picture: response.data.url },
        { new: true }).populate('friends');
    })
    .catch(err => {
      return err;
    });
}

function updateFriends(user: any, token: string) {
  return getFbFriends(token)
    .then((response: any) => {
      return compareFriends(user, response.data);
    })
    .then((values: any) => {
      return new Promise((resolve, reject) => {
        resolve(user);
      });
    })
    .catch((err: any) => {
      return err;
    });
}

function compareFriends(user: any, fbFriends: Array<Object>) {
  let promises: any[] = [];
  fbFriends.forEach((friend: any) => {
    promises.push(findByFacebookId(friend['id']));
  });
  return Promise.all(promises)
    .then(values => {
      return User.findOneAndUpdate(
        { _id: user.id },
        { friends: values }).populate({ path: 'friends', model: 'User' });
    });
}