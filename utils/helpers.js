const exphbs = require('express-handlebars');
const path = require('path');

// Register custom Handlebars helpers
const helpers = exphbs.create({
  extname: '.hbs',
  defaultLayout: undefined, // No default layout
  layoutsDir: path.join(__dirname, '../views/layouts'), // Layouts directory
  partialsDir: path.join(__dirname, '../views/partials'), // Partials directory
  helpers: {
    ifCond: function (v1, operator, v2, options) {
      switch (operator) {
        case '==':
          return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
          return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=':
          return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '!==':
          return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<':
          return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
          return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
          return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
          return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
          return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
          return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
          return options.inverse(this);
      }
    },
    
    formatRupiah: function(angka) {
      // Format angka menjadi format Rupiah
      if (typeof angka === 'number') {
        return 'Rp ' + angka.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      }
      return 'Rp 0';
    }
  }
});

module.exports = helpers;