import * as express from 'express';
import * as dotenv from 'dotenv';
import * as bodyParser from 'body-parser';
import * as mongoose from 'mongoose';

import homeController from './controllers/home.controller';
import usersController from './controllers/users.controller';

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
app.use('/', homeController);
app.use('/users', usersController);

/**
 * Start server
 */
app.listen(app.get('port'), () => {
  console.log(('App is running at http://localhost:%d in %s mode'),
    app.get('port'), app.get('env'));
  console.log('Press CTRL-C to stop\n');
});

module.exports = app;
