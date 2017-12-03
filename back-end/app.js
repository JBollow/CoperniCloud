var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// mongodb?
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/copernicloud');

var index = require('./routes/index');

var app = express();

var port = 10002;
app.listen(port, function (err, res) {
    if (err) {
        console.log('backend error');
    } else {
        console.log('backend started on port: ' + port);
    }
});

// view engine setup
app.set('view engine', 'jade');

// CORS to avoid cross-origin errors
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(express.static(path.join(__dirname, 'routes')));

app.use(favicon(path.join(__dirname, './img', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());

// Make our db accessible to our router
app.use(function (req, res, next) {
    req.db = db;
    next();
  });

app.use('/', index);

// catch 404 and forward to error handler
// development 404 page
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });
  
  // error handler
  app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });
  
module.exports = app;