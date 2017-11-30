import * as dotenv from 'dotenv';
import { ExtractJwt, StrategyOptions } from 'passport-jwt';

dotenv.config();

export let JwtOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
  secretOrKey: process.env.SECRET_SERVER_KEY || 'simple-server-key',
};