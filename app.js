var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var jwt = require('express-jwt');
require('dotenv').config();



var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var database = require('./database/database')
var config = require('./config')

var app = express();



mongoose.connect(database.mongoUrl);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: true}));

app.use(cookieParser(process.env.COOKIESECRIT));



app.use('/', indexRouter);
app.use('/users',jwt({
  secret: config.secret,//secret key
  getToken: function fromHeaderOrQuerystring (req) {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
  return req.headers.authorization.split(' ')[1];
  } else if (req.signedCookies && req.signedCookies.token) {
  return req.signedCookies.token;//req.signedCookies used when cookies are signed
  //if not signed ......req.cookies.name
  }
  return null;
}
}), usersRouter);

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
