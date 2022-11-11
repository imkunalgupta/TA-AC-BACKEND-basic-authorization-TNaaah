var express = require('express');
var router = express.Router();
const User = require('../models/User');
const auth = require('../middlewares/auth');

// registration routers
router.get('/register', function (req, res, next) {
  res.render('userRegister');
});

router.get('/register/admin', function (req, res, next) {
  let flashError = req.flash('error')[0];
  res.render('registerAdminForm', { flashError });
});

router.post('/register/admin', function (req, res, next) {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) return next(err);

    if (user) {
      req.flash('error', 'User exists with given email');
      return res.redirect('/users/register/admin');
    }

    if (req.body.password.length < 6 || req.body.password.length > 20) {
      req.flash('error', 'Password must be between 6 and 20 characters.');
      return res.redirect('/users/register/admin');
    }

    req.body.isAdmin = true;
    const adminData = req.body;
    User.create(adminData, (err, user) => {
      if (err) return next(err);
      res.redirect('/users/login');
    });
  });
});

router.get('/register/user', function (req, res, next) {
  let flashError = req.flash('error')[0];
  res.render('registerUserForm', { flashError });
});

router.post('/register/user', function (req, res, next) {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) return next(err);

    if (user) {
      req.flash('error', 'User exists with given email.');
      res.redirect('/users/register/user');
    }

    if (req.body.password.length < 6 || req.body.password.length > 20) {
      req.flash('error', 'Password must be between 6 and 20 characters.');
      return res.redirect('/users/register/user');
    }

    req.body.isAdmin = false;
    const userData = req.body;
    User.create(userData, (err, user) => {
      if (err) return next(err);
      res.redirect('/users/login');
    });
  });
});

// login routers

router.get('/login', function (req, res, next) {
  let flashError = req.flash('error')[0];
  res.render('userLogin', { flashError });
});

router.post('/login', function (req, res, next) {
  let { email, password } = req.body;

  if (!email || !password) {
    req.flash('error', 'Please enter both email and password.');
    res.redirect('/users/login');
  }

  User.findOne({ email }, (err, user) => {
    if (err) return next(err);

    if (!user) {
      req.flash('error', 'User is not registered.');
      return res.redirect('/users/login');
    }

    user.verifyPassword(password, (err, result) => {
      if (err) return next(err);

      if (!result) {
        req.flash('error', 'Password is incorrect');
        res.redirect('/users/login');
      }

      req.session.userId = user.id;
      req.session.isAdmin = user.isAdmin;

      res.render('dashboard', { user, error: '' });
    });
  });
});

router.get('/dashboard', (req, res, next) => {
  let error = req.flash('error')[0];
  res.render('dashboard', { error });
});

router.get('/logout', auth.loggedInUser, function (req, res, next) {
  req.session.destroy();
  res.clearCookie('connect.sid');
  res.redirect('/users/login');
});

module.exports = router;
