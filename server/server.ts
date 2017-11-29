import * as express from 'express';
import * as dotenv from 'dotenv';
import * as bodyParser from 'body-parser';
import * as mongoose from 'mongoose';
import * as http from 'http';
import * as socket from 'socket.io';
import * as cors from 'cors';

import homeController from './controllers/home.controller';
import usersController from './controllers/users.controller';
import skillsController from './controllers/skills.controller';
import chatController from './controllers/chat.controller';

import { Chat } from './models/chat';

dotenv.config();

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

const app = express();

app.set('port', process.env.PORT || 3000);
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
io.on('connection', (socket: any) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('add-message', (message: any) => {
    console.log('message: ', message);
    io.emit('message', {type: 'new-message', message});
  });
});

/**
 * Exports app
 */
module.exports = app;
