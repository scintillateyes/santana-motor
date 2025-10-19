require('dotenv').config();
var mysql = require('mysql2');

var dbconfig = require('../config/database');

// Database setup
var pool = mysql.createPool({
  ...dbconfig.connection,
  database: dbconfig.database
});

// Helper function for querying the db; releases the db connection
// callback(err, rows)
var query = function(queryString, params, callback) {
  pool.getConnection(function(err, conn) {
    if (err)
      return callback(err);
    
    conn.query(queryString, params, function(err, rows) {
      conn.release();

      if (err)
        return callback(err);

      return callback(err, rows);
    });
  });
};

// Heartbeat function to keep the connection to the database up
var keepAlive = function() {
  pool.getConnection(function(err, conn) {
    if (err)
      return;

    conn.ping();
    conn.release();
  });
};

// Set up a keepalive heartbeat
setInterval(keepAlive, 30000);

exports.query = query;
