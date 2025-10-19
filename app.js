var bodyParser   = require('body-parser');
var cookieParser = require('cookie-parser');
var express      = require('express');
var favicon      = require('serve-favicon');
var flash        = require('connect-flash');
var logger       = require('morgan');
var passport     = require('passport');
var path         = require('path');
var session      = require('express-session');
const helpers    = require('./utils/helpers');

var app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', helpers.engine);
app.set('view engine', '.hbs');

// Set up favicon, logging, parsing, static files
// Uncomment after placing your favicon in public/images/
//app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Set up passport strategies and message passing
require('./config/passport')(passport);
app.use(session({
  secret: 'projectsecret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Set up routes and pass in configured passport
require('./routes/index.js')(app);
require('./routes/auth.js')(app, passport);
require('./routes/users.js')(app, passport);
require('./routes/vehicles.js')(app);
require('./routes/transactions.js')(app);
require('./routes/admin_vehicles.js')(app);
require('./routes/admin_transactions.js')(app);
require('./routes/admin_customers.js')(app);
require('./routes/vehicle_images.js')(app);
require('./routes/admin_reports.js')(app);
require('./routes/sales_report.js')(app);
require('./routes/admin_pages.js')(app);

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handlers

// Development error handler
// Will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// Production error handler
// No stacktraces leaked to user
app.use(function(err, req, res) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
