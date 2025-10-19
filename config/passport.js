var LocalStrategy = require('passport-local').Strategy;

var db = require('../models/db');
var user = require('../models/user');

module.exports = function(passport) {

  // Passport session setup, required for persistent login sessions
  // Used to serialize and unserialize users out of session
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    // Get full user details when deserializing
    user.getUserById(id, function(err, user) {
      done(err, user);
    });
  });

  // Local signup
  passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // Pass the entire request back to the callback
  }, function(req, email, password, done) {
    // Extract additional fields from the request
    var name = req.body.name;
    var phone = req.body.phone;
    var address = req.body.address;
    
    user.signup(req, email, password, name, phone, address, function(err, user, message) {
      return done(err, user, message);
    });
  }));

  // Local login
  passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // Pass the entire request back to the callback
  }, user.login));

};
