var bcrypt = require('bcryptjs'); // Changed from bcrypt-nodejs to bcryptjs

var db = require('./db');

// Set up User class
var User = function(user) {
  var that = Object.create(User.prototype);

  that.id = user.id;
  that.email = user.email;
  that.password = user.password;
  that.name = user.name;
  that.phone = user.phone;
  that.address = user.address;
  that.role = user.role;

  return that;
};

// Hash and salt the password with bcrypt
var hashPassword = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
};

// Check if password is correct
var validPassword = function(password, savedPassword) {
  return bcrypt.compareSync(password, savedPassword);
};

// Create a new user
// callback(err, newUser)
var createUser = function(userData, callback) {
  var newUser = {
    email: userData.email,
    password: hashPassword(userData.password),
    name: userData.name || null,
    phone: userData.phone || null,
    address: userData.address || null,
    role: userData.role || 'customer' // Default role is customer
  };
  
  var query = 'INSERT INTO users (email, password, name, phone, address, role) VALUES (?, ?, ?, ?, ?, ?)';
  var params = [
    newUser.email, 
    newUser.password, 
    newUser.name, 
    newUser.phone, 
    newUser.address, 
    newUser.role
  ];
  
  db.query(query, params, function(err) {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        // If email already exists, return error
        return callback(null, false, 'An account with that email address already exists.');
      }
      return callback(err);
    }

    // Get the inserted user with auto-generated ID
    var selectQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(selectQuery, [userData.email], function(err, rows) {
      if (err) return callback(err);
      
      // Successfully created user
      return callback(null, new User(rows[0]));
    });
  });
};

// Check if a user exists and create them if they do not
// callback(err, newUser)
var signup = function(req, email, password, name, phone, address, callback) {
  // Check if there's already a user with that email
  db.query('SELECT * FROM users WHERE email = ?', [email], function(err, rows) {
    if (err)
      return callback(err);

    if (rows.length) {
      return callback(null, false, req.flash('signupMessage', 'An account with that email address already exists.'));
    } else {
      // No user exists, create the user
      var userData = {
        email: email,
        password: password,
        name: name,
        phone: phone,
        address: address,
        role: 'customer'
      };
      return createUser(userData, callback);
    }
  });
};

// Log in a user
// callback(err, user)
var login = function(req, email, password, callback) {
  // Check that the user logging in exists
  db.query('SELECT * FROM users WHERE email = ?', [email], function(err, rows) {
    if (err)
      return callback(err);

    if (!rows.length)
      return callback(null, false, req.flash('loginMessage', 'No user found.'));

    if (!validPassword(password, rows[0].password))
      return callback(null, false, req.flash('loginMessage', 'Wrong password.'));

    // User successfully logged in, return user
    return callback(null, new User(rows[0]));
  });
};

// Get user by ID
// callback(err, user)
var getUserById = function(id, callback) {
  db.query('SELECT id, email, name, phone, address, role, created_at FROM users WHERE id = ?', [id], function(err, rows) {
    if (err)
      return callback(err);

    return callback(null, rows[0]);
  });
};

// Get all users (for admin use)
// callback(err, users)
var getAllUsers = function(callback) {
  db.query('SELECT id, email, name, phone, address, role, created_at FROM users ORDER BY created_at DESC', [], function(err, rows) {
    if (err)
      return callback(err);

    return callback(null, rows);
  });
};

// Update user profile
// callback(err, user)
var updateUserProfile = function(id, userData, callback) {
  var query = 'UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?';
  var params = [userData.name, userData.phone, userData.address, id];
  
  db.query(query, params, function(err, result) {
    if (err)
      return callback(err);

    // Return updated user
    getUserById(id, callback);
  });
};

// Delete a user
// callback(err)
var deleteUser = function(id, callback) {
  db.query('DELETE FROM users WHERE id = ?', [id], callback);
};

// Check if user is admin
// callback(err, is_admin)
var isAdmin = function(id, callback) {
  db.query('SELECT role FROM users WHERE id = ?', [id], function(err, rows) {
    if (err)
      return callback(err);

    var is_admin = rows.length > 0 && rows[0].role === 'admin';
    return callback(null, is_admin);
  });
};

exports.signup = signup;
exports.login = login;
exports.getUserById = getUserById;
exports.getAllUsers = getAllUsers;
exports.updateUserProfile = updateUserProfile;
exports.listUsers = getAllUsers; // Keep backward compatibility
exports.deleteUser = deleteUser;
exports.isAdmin = isAdmin;
