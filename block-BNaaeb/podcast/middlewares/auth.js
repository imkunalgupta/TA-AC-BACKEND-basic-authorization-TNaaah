const User = require('../models/User');

module.exports = {
  loggedInUser: (req, res, next) => {
    if (req.session && req.session.userId) {
      next();
    } else {
      req.flash('error', 'Please login to view content');
      res.redirect('/users/login');
    }
  },

  userInfo: (req, res, next) => {
    let userId = req.session && req.session.userId;
    if (userId) {
      User.findById(userId, 'name userType isAdmin', (err, user) => {
        req.user = user;
        res.locals.user = user;
        next();
      });
    } else {
      req.user = null;
      res.locals.user = null;
      next();
    }
  },

  isAdmin: (req, res, next) => {
    if (req.session.userId && req.session.isAdmin) {
      next();
    } else if (req.session.userId) {
      req.flash('error', 'You are not authorized to view requested content.');
      res.redirect('/users/dashboard');
    } else {
      req.flash('error', 'Please login to continue.');
      res.redirect('/users/login');
    }
  },
};
