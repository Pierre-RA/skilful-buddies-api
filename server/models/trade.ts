import * as Mongoose from 'mongoose';
import { IUser } from './user';

interface ITradeModel extends ITrade, Mongoose.Document {}

export interface ITrade {
  name: string;
  content: string;
  owner: IUser;
  price: {
    value: number,
    type: string
  };
  color: string;
}

export let tradeSchema = new Mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  content: {
    type: String
  },
  price: {
    value: {
      type: Number,
    },
    currency: {
      type: String
    }
  },
  owner: {
    type: Mongoose.Schema.Types.ObjectId,
    ref: 'Trade'
  },
  color: {
    type: String,
    default: () => { return 'hsl(' +
      360 * Math.random() + ',' +
      (25 + 70 * Math.random()) + '%,' + 
      (25 + 10 * Math.random()) + '%)';
    }
  }
});

export let Trade = Mongoose.model<ITradeModel>('Trade', tradeSchema);