import { Request, Response, Router } from 'express';
import * as dotenv from 'dotenv';
import * as cors from 'cors';
import * as request from 'request-promise';
import * as slug from 'slug';
import * as jwt from 'jsonwebtoken';
import * as passport from 'passport';

import parseGeoCoder from '../utils/parse-geocoder';
import { User, JwtOptions } from '../models';

dotenv.config();
const router = Router();

router.options('/', cors());
router.options('/facebook', cors());
router.options('/geocode/:id', cors());
router.options('/friends/:id', cors());
router.options('/:id', cors());

router.get('/', cors(), passport.authenticate('jwt', {session: false}), (req: Request, res: Response) => {
  User.find({})
    .slice('friends', 8)
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
      return findByFacebookId(fbUser.id, null);
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
      let jwtPayload = { id: doc._id };
      let jwtToken = jwt.sign(jwtPayload, JwtOptions.secretOrKey);
      res.json({
        user: doc,
        token: jwtToken
      });
    })
    .catch((err: any) => {
      res.status(401).json({
        message: 'cannot login to facebook.',
        error: err
      });
    });
});

// router.get('/friends', cors(), (req: Request, res: Response) => {
//   if (req.query.name) {
//     User.find()
//   } else {
// 
//   }
// });

router.get('/friends/:id', cors(), passport.authenticate('jwt', {session: false}), (req: Request, res: Response) => {
  if (req.query.name) {
    User.findOne({ _id: req.params.id }, 'friends')
      .populate({
        path: 'friends',
        select: 'name',
        match: { name: {$regex: req.query.name, $options: 'i' }},
      })
      .then(doc => {
        res.json(doc);
      })
      .catch(err => {
        res.status(400)
          .json(err);
      });
  } else {
    User.findOne({ _id: req.params.id }, 'friends')
      .populate('friends', 'name')
      .then(doc => {
      res.json(doc);
    });
  }
});

router.get('/:id', cors(), passport.authenticate('jwt', {session: false}), (req: Request, res: Response) => {
  User.findOne({ _id: req.params.id })
    .slice('friends', 8)
    .populate('friends')
    .populate('skills')
    .then(doc => {
      res.json(doc);
    })
    .catch(err => {
      res.status(400)
        .json(err);
    });
});

router.put('/:id', cors(), passport.authenticate('jwt', {session: false}), (req: Request, res: Response) => {
  User.findOneAndUpdate(
    { _id: req.params.id },
    req.body,
    { new: true }
  ).then(doc => {
    res.json(doc);
  }).catch(err => {
    res.status(400)
      .json(err);
  });
});

router.put('/geocode/:id', cors(), passport.authenticate('jwt', {session: false}), (req: Request, res: Response) => {
  getGeocode(req.body.address)
    .then(response => {
      return parseGeoCoder(response);
    })
    .then(response => {
      if (!response) {
        res.status(400).json({
          message: 'address not found'
        });
      } else {
        return User.findOneAndUpdate(
          { _id: req.params.id },
          { place: response },
          { new: true }
        );
      }
    })
    .then(response => {
      res.json(response);
    })
    .catch(err => {
      res.status(400)
        .json(err);
    });
});

export default router;

function findByFacebookId(id: string, userId: string) {
  if (userId) {
    return User.findOneAndUpdate(
      { 'social.facebook' : id },
      { $push: { friends: userId} }
    );
  }
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

function getGeocode(address: string) {
  address = address.replace(/ /, '+');
  return request({
    method: 'GET',
    uri: 'https://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&key=' + process.env.GOOGLE_GEOCODE_API,
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
    promises.push(findByFacebookId(friend['id'], user._id));
  });
  return Promise.all(promises)
    .then(values => {
      return User.findOneAndUpdate(
        { _id: user.id },
        { friends: values }).populate({ path: 'friends', model: 'User' });
    });
}