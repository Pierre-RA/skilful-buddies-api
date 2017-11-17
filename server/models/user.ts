import * as Mongoose from 'mongoose';

interface IUserModel extends IUser, Mongoose.Document {}

export interface IUser {
  name: string;
  gender: string;
  slug: string;
  picture: string;
  city: string;
  social: {
    facebook: string,
    linkedIn: string,
    google: string,
    twitter: string
  };
  skills: Array<string>;
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
  city: {
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
  skills: [String],
  friends: [{ type: Mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

export let User = Mongoose.model<IUserModel>('User', userSchema);