var express = require('express');
var auth = require('express-jwt-token');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var socket_io = require("socket.io");
var database = require("./bin/database/database");
var app = express();
var io = socket_io();
app.io = io;

database.connect().then(function () {
    var webSockets = require('./routes/webSockets')(io);

    database.createUser("milos", "123");
    database.createUser("martas", "123");
    database.createUser("mil", "123");
    database.createUser("monty", "123");
    database.resetSocketId()
    database.createGlobalRoom().then(function (result) {
        console.log(result)
    })
});


var index = require('./routes/index');
var api = require('./routes/api');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

const util = require('util');
//console.log(util.inspect(jwt, {showHidden: false, depth: null}));
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/chat', auth.jwtAuthProtected, webSockets);

app.use('/', index);
app.use('/api', api);


//database.removeUserByUserName("martas");
// catch 404 and forward to error handler
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
