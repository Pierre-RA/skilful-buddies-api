import * as express from 'express';
import * as dotenv from 'dotenv';
import * as bodyParser from 'body-parser';
import * as mongoose from 'mongoose';
import * as http from 'http';
import * as socket from 'socket.io';
import * as cors from 'cors';
import * as jwt from 'jsonwebtoken';
import * as passport from 'passport';
import * as passportJWT from 'passport-jwt';

import homeController from './controllers/home.controller';
import usersController from './controllers/users.controller';
import skillsController from './controllers/skills.controller';
import chatController from './controllers/chat.controller';
import tradeController from './controllers/trades.controller';

import { Chat, User, JwtOptions } from './models';

dotenv.config();
const JwtStrategy = passportJWT.Strategy;

/**
 * MONGODB CONNECTION
 */
(<any>mongoose).Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI, {
  useMongoClient: true
});
mongoose.connection.on('error', () => {
  console.error('MongoDB connection error. Please make sur MongoDB is running.');
  process.exit();
});
mongoose.connection.on('open', () => {
  console.log('MongoDB connection is open.');
});

/**
 * JWT TOKEN STRATEGY
 */
const strategy = new JwtStrategy(JwtOptions, (payload: any, next: any) => {
  User.findOne({ _id: payload.id }, (err, user) => {
    if (err) {
      return next(null, false);
    }
    if (user) {
      return next(null, user);
    }
    return next(null, false);
  });
});
passport.use(strategy);

/**
 * APP
 */
const app = express();

app.set('port', process.env.PORT || 3000);
app.use(passport.initialize());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.all('*', (req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log(new Date() + ' ' + req.method + ' ' + req.url);
  next();
});

/**
 * Routes
 */
app.use(cors({
  origin: 'http://localhost:4200',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 200,
  credentials: true
}));
app.use('/', homeController);
app.use('/users', usersController);
app.use('/skills', skillsController);
app.use('/trade', tradeController);
app.use('/chat', chatController);

/**
 * Start server
 */
let server = app.listen(app.get('port'), () => {
  console.log(('App is running at http://localhost:%d in %s mode'),
    app.get('port'), app.get('env'));
  console.log('Press CTRL-C to stop\n');
});

/**
 * Socket.io chat
 */
let io = socket.listen(server);
let rooms: any[];

Chat.find({})
  .then(chats => {
    rooms = chats;
    
    io.sockets.on('connection', socket => {
      
      // DISCONNECT
      socket.on('disconnect', () => {
        console.log(new Date() + ' user disconnected');
      });
      
      // HELLO
      socket.on('send-hello', name => {
        console.log(new Date() + ' ' + name + ' is connected.');
      })
      
      // JOIN ROOM
      socket.on('join-room', id => {
        socket.join(id);
        console.log(new Date() + ' joined room: ' + id);
      });
      
      // ADD MESSAGE
      socket.on('add-message', (message: any) => {
        Chat.findOneAndUpdate({ _id: message.id }, {$push: { messages: {
          user: message.user,
          text: message.text,
          date: message.date
        }}, read: false }).then(doc => {
          io.sockets.in(message.id).emit('message', message);
          console.log(new Date() + ' add message to room: ' + message.id);
        });
      });
      
      // HAS READ THE ROOM
    });
  });

/**
 * Exports app
 */
module.exports = app;
