import * as Mongoose from 'mongoose';
import { IUser } from './user';

interface IChatModel extends IChat, Mongoose.Document {}

export interface IChat {
  user1: IUser;
  user2: IUser;
  title: string;
  messages: Array<IMessage>;
}

export interface IMessage {
  user: IUser;
  date: string;
  text: string;
}

export let chatSchema = new Mongoose.Schema({
  user1: {
    type: Mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  user2: {
    type: Mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  title: {
    type: String
  },
  messages: [{
    user: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: String,
    text: String
  }]
});

export let Chat = Mongoose.model<IChatModel>('Chat', chatSchema);