import * as Mongoose from 'mongoose';
import { IUser } from './user';

interface ISkillModel extends ISkill, Mongoose.Document {}

export interface ISkill {
  name: string;
  content: string;
  owner: IUser;
  color: string;
}

export let skillSchema = new Mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  content: {
    type: String
  },
  owner: {
    type: Mongoose.Schema.Types.ObjectId,
    ref: 'Skill'
  },
  color: {
    type: String,
    default: 'hsl(' +
      360 * Math.random() + ',' +
      (25 + 70 * Math.random()) + '%,' + 
      (85 + 10 * Math.random()) + '%)'
  }
});

export let Skill = Mongoose.model<ISkillModel>('Skill', skillSchema);