import * as Mongoose from 'mongoose';
import { ISkill } from './skill';
import { ITrade } from './trade';

interface IUserModel extends IUser, Mongoose.Document {}

export interface IUser {
  name: string;
  gender: string;
  slug: string;
  picture: string;
  age: string;
  citizenship: string;
  social: {
    facebook: string,
    linkedIn: string,
    google: string,
    twitter: string
  };
  place: {
    address: string,
    city: string,
    state: string,
    country: string,
    latitude: number,
    longitude: number
  }
  skills: Array<ISkill>;
  trades: Array<ITrade>;
  friends: Array<IUser>;
}

export let userSchema = new Mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  gender: {
    type: String
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  age: {
    type: String
  },
  citizenship: {
    type: String
  },
  picture: {
    type: String
  },
  social: {
    facebook: {
      type: String
    },
    linkedIn: {
      type: String
    },
    google: {
      type: String
    },
    twitter: {
      type: String
    }
  },
  place: {
    address: String,
    city: String,
    state: String,
    country: String,
    latitude: Number,
    longitude: Number
  },
  skills: [{ type: Mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
  trades: [{ type: Mongoose.Schema.Types.ObjectId, ref: 'Trade' }],
  friends: [{ type: Mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

export let User = Mongoose.model<IUserModel>('User', userSchema);