'use strict';

// Libs
var express = require('express'),
    session = require('express-session'),
    path = require('path'),
    cors = require('cors'),
    bodyParser = require('body-parser'),
    validator = require('express-validator'),
    colors = require('colors/safe'),
    busboy = require('connect-busboy'),
    passport = require('passport'),
    app = express();

// Setup globals
global._ = require('lodash').mixin(require('lodash-isnumeric'));
global.app = app;
global.BASE_PATH = __dirname;
global.CONFIG = require(path.join(BASE_PATH, 'config', 'config'));
global.Knex = require('knex')(CONFIG.DB);
global.Bookshelf = require('bookshelf')(Knex).plugin(['virtuals','registry']);

// Utilities
var utils = require(path.join(BASE_PATH, '/classes/utils'));
app.set('utils', utils);
app.set('auth', require(path.join(BASE_PATH, '/classes/auth')));

// Models
app.set('User', require(BASE_PATH + '/models/user'));
app.set('Note',require(BASE_PATH + '/models/note'));

// Middleware
app.use(busboy());
app.use(validator());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({ secret: CONFIG.AUTH.TOKEN.SECRET, resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Static assets
app.use('/app', express.static('app'));
app.use('/prev', express.static('prev'));
app.use('/' + CONFIG.ASSETS_PATH, express.static(CONFIG.ASSETS_PATH));

// Routes
app.use(cors());
//app.use('/', require(path.join(BASE_PATH, 'routes', 'base')));
app.use('/users', require(path.join(BASE_PATH, 'routes', 'users')));
app.use('/notes', require(path.join(BASE_PATH, 'routes', 'notes')));
// Catch 404 and forward to error handler
app.use( function(req, res) {
    app.get('utils').res.error(res, {message: 'Bad Request', reason: 'Incorrect routing', status: 404});
});

// Log server is sarted
var msg1 = utils.pad(CONFIG.NAME.toUpperCase() + ' (' + app.get('env') + ')', 10),
    msg2 = 'version: ' + CONFIG.VERSION;

console.log(colors.green(_.repeat('*', msg1.length)));
console.log(colors.green(msg1));
console.log(colors.green(utils.pad(msg2, ((msg1.length - msg2.length) / 2))));
console.log(colors.green(_.repeat('*', msg1.length)));

module.exports = app;
