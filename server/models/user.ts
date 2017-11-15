import * as Mongoose from 'mongoose';

interface IUserModel extends IUser, Mongoose.Document {}

export interface IUser {
  name: string;
  gender: string;
  social: {
    facebook: string,
    linkedIn: string,
    google: string,
    twitter: string
  };
}

export let userSchema = new Mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  gender: {
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
  }
});

export let User = Mongoose.model<IUserModel>('User', userSchema);