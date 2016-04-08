'use strict';

var express = require('express'),
	  router = express.Router(),
		auth = app.get('auth'),
		users = require(BASE_PATH + '/controllers/users'),
		passport = require('passport');

var TwitterStrategy = require('passport-twitter').Strategy,
		FacebookStrategy = require('passport-facebook').Strategy,
		GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
		LinkedInStrategy = require('passport-linkedin-oauth2').OAuth2Strategy;

// GET
 router.get('/',  users.list);
// router.get('/:id',users.single);

// POST
router.post('/', users.registration);
router.post('/login', users.login);


// Routers for Google-AUTH

router.get('/auth/google',passport.authenticate('google', { scope :  'email'}));
router.get('/auth/google/callback',
            passport.authenticate('google', {
                    successRedirect : 'http://localhost:3000/#/',
                    failureRedirect : 'http://localhost:3000/#/login'
            }));


	//////////////////////adding passport config/////////////////
						// Passport serialization
						passport.serializeUser( function(token, callback) {
							callback(null, token);
						});

						passport.deserializeUser( function(token, callback) {
							callback(null, token);
						});

						// Facebook strategy
						passport.use(new FacebookStrategy({
								clientID: CONFIG.AUTH.facebook.clientID,
								clientSecret: CONFIG.AUTH.facebook.clientSecret,
								callbackURL: CONFIG.AUTH.facebook.callbackURL,
								profileFields: ['id', 'emails', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified']
							},
							function(accessToken, refreshToken, profile, callback) {
								auth.social.validate(accessToken, profile, 'facebook_id', callback);
							}
						));

						// Linkedin strategy
						passport.use(new LinkedInStrategy({
								clientID: CONFIG.AUTH.linkedin.clientID,
								clientSecret: CONFIG.AUTH.linkedin.clientSecret,
								callbackURL: CONFIG.AUTH.linkedin.callbackURL,
								scope: ['r_basicprofile', 'r_emailaddress'],
								state: true
							},
							function(accessToken, refreshToken, profile, callback) {
								auth.social.validate(accessToken, profile, 'linkedin_id', callback);
							}
						));

						// Twitter strategy
						passport.use(new TwitterStrategy({
								consumerKey: CONFIG.AUTH.twitter.consumerKey,
								consumerSecret: CONFIG.AUTH.twitter.consumerSecret,
								callbackURL: CONFIG.AUTH.twitter.callbackURL
							},
							function(accessToken, refreshToken, profile, callback) {
								auth.social.validate(accessToken, profile, 'twitter_id', callback);
							}
						));

						// Google strategy
						passport.use(new GoogleStrategy({
								clientID: CONFIG.AUTH.google.clientID,
								clientSecret: CONFIG.AUTH.google.clientSecret,
								callbackURL: CONFIG.AUTH.google.callbackURL
							},
							function(accessToken, refreshToken, profile, callback) {
								auth.social.validate(accessToken, profile, 'google_id', callback);
							}
						));


module.exports = router;
