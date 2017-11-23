import * as Mongoose from 'mongoose';
import { IUser } from './user';

interface ISkillModel extends ISkill, Mongoose.Document {}

export interface ISkill {
  name: string;
  content: string;
  owner: IUser;
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
  }
});

export let Skill = Mongoose.model<ISkillModel>('Skill', skillSchema);