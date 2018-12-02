var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/user');
var registrationRouter = require('./routes/register');
var homeRouter = require('./routes/home');
var itemRouter = require('./routes/item');
var serveStatic = require('serve-static');

var app = express();

mongoose.connect(
  'mongodb://se340da:se340da@users-shard-00-00-5lblw.mongodb.net:27017,users-shard-00-01-5lblw.mongodb.net:27017,users-shard-00-02-5lblw.mongodb.net:27017/EZ-Claim?ssl=true&replicaSet=USERS-shard-0&authSource=admin&retryWrites=true', { useNewUrlParser: true });


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(serveStatic(path.join(__dirname, 'public')));
//app.use(express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/item', itemRouter);
app.use('/registration', registrationRouter);
app.use('/home', homeRouter);























// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
